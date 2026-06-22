using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Application.Users.Dtos;
using Aptiverse.Core.Dtos;
using Aptiverse.Core.Exceptions;
using Aptiverse.Core.Services;
using Aptiverse.Domain.Models;
using Aptiverse.Entitlements.Application.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aptiverse.Application.Auth.Services
{
    /// <summary>
    /// One backend endpoint, one provider (Google), all clients
    /// (web + mobile). Web flow: NextAuth completes OAuth dance and POSTs
    /// the ID token here. Mobile flow: native SDK does the OAuth and
    /// POSTs the ID token here. In both cases this service validates
    /// the token with Google, upserts a User in Identity, and issues
    /// an Aptiverse JWT.
    /// </summary>
    public class OAuthExchangeService(
        UserManager<User> userManager,
        ITokenProvider tokenProvider,
        IConfiguration config,
        ILogger<OAuthExchangeService> logger,
        IEntitlementService entitlements) : IOAuthExchangeService
    {
        private const string GoogleProvider = "google";

        public async Task<TokenDto<UserDto>> ExchangeAsync(OAuthExchangeDto request)
        {
            if (string.IsNullOrWhiteSpace(request.IdToken))
                throw new AuthenticationException("ID token is required");

            var (email, externalId, firstName, lastName) = request.Provider.ToLowerInvariant() switch
            {
                GoogleProvider => await ValidateGoogleAsync(request.IdToken),
                _ => throw new AuthenticationException($"Unsupported provider: {request.Provider}"),
            };

            var user = await userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new User
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FirstName = firstName ?? string.Empty,
                    LastName = lastName ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                };
                var result = await userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    var error = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new UserRegistrationException($"Failed to create user from {request.Provider}: {error}");
                }

                // Default new social-login users to Student role; admins
                // can promote later.
                await userManager.AddToRoleAsync(user, "Student");

                // Track the external login so the user can sign in with
                // either email/password or the social provider afterwards.
                await userManager.AddLoginAsync(user, new UserLoginInfo(
                    request.Provider, externalId, request.Provider));
                logger.LogInformation("Created user {Email} via {Provider}", email, request.Provider);
            }
            else
            {
                // Make sure the social login is linked even if the user
                // originally registered with email/password.
                var existingLogins = await userManager.GetLoginsAsync(user);
                if (!existingLogins.Any(l => l.LoginProvider == request.Provider))
                {
                    await userManager.AddLoginAsync(user, new UserLoginInfo(
                        request.Provider, externalId, request.Provider));
                }
                user.UpdatedAt = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
            }

            var roles = await userManager.GetRolesAsync(user);
            var features = await entitlements.GetFeaturesAsync(user.Id);
            var token = await tokenProvider.GenerateJwtTokenAsync(user, roles, features);

            return new TokenDto<UserDto>
            {
                Token = token.ToString(),
                Expires = DateTime.Now.AddHours(Convert.ToDouble(config["Jwt:ExpireHours"] ?? "4")),
                User = new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = [.. roles],
                    Role = PermissionResolver.PrimaryRole(roles),
                    Permissions = PermissionResolver.PermissionsFor(roles),
                    DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                },
                Message = $"Signed in via {request.Provider}",
            };
        }

        // ---- Google ID token validation -----------------------------------
        private async Task<(string Email, string ExternalId, string? FirstName, string? LastName)>
            ValidateGoogleAsync(string idToken)
        {
            var googleClientId = config["Authentication:Google:ClientId"];
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings();
                if (!string.IsNullOrWhiteSpace(googleClientId))
                {
                    settings.Audience = [googleClientId];
                }
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
                if (string.IsNullOrEmpty(payload.Email))
                    throw new AuthenticationException("Google token missing email claim");

                return (payload.Email, payload.Subject, payload.GivenName, payload.FamilyName);
            }
            catch (InvalidJwtException ex)
            {
                logger.LogWarning(ex, "Invalid Google ID token");
                throw new AuthenticationException("Invalid Google ID token");
            }
        }

    }
}
