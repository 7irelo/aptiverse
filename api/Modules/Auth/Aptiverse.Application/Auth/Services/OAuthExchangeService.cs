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
        IEntitlementService entitlements,
        ITokenStorageService tokenStorage) : IOAuthExchangeService
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
                // Google sign-up: provision a new Student account. Google has
                // verified the email, so it's confirmed. The academic profile
                // (student type + curriculum/institution) is captured in the
                // onboarding step on first sign-in.
                user = new User
                {
                    UserName = email,
                    Email = email,
                    EmailConfirmed = true,
                    FirstName = string.IsNullOrWhiteSpace(firstName) ? email.Split('@')[0] : firstName,
                    LastName = lastName ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                };
                var result = await userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    var error = string.Join(", ", result.Errors.Select(e => e.Description));
                    logger.LogWarning("Google sign-up failed for {Email}: {Errors}", email, error);
                    throw new UserRegistrationException(
                        $"Failed to create your account from {request.Provider}: {error}");
                }

                await userManager.AddToRoleAsync(user, "Student");
                await userManager.AddLoginAsync(user, new UserLoginInfo(
                    request.Provider, externalId, request.Provider));
                logger.LogInformation("Created user {Email} via {Provider}", email, request.Provider);
            }
            else
            {
                // Link the social login even if they originally registered with
                // email/password, so future logins resolve cleanly.
                var existingLogins = await userManager.GetLoginsAsync(user);
                if (!existingLogins.Any(l => l.LoginProvider == request.Provider))
                {
                    await userManager.AddLoginAsync(user, new UserLoginInfo(
                        request.Provider, externalId, request.Provider));
                }
                // Google has verified this address, and it is the same address
                // on the account. Someone who registered with a password, never
                // clicked the link, then signed in with Google has proved
                // ownership just as well. Without this they would sit in a split
                // state: able to enter through Google, refused at the password
                // form, and holding a verification mail they never opened.
                if (!user.EmailConfirmed)
                {
                    user.EmailConfirmed = true;
                    logger.LogInformation(
                        "Confirmed {Email} via verified {Provider} sign-in", email, request.Provider);
                }
                user.UpdatedAt = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
            }

            var roles = await userManager.GetRolesAsync(user);
            var features = await entitlements.GetFeaturesAsync(user.Id);
            var token = await tokenProvider.GenerateJwtTokenAsync(user, roles, features);

            // A Google sign-in is a sign-in, so it starts a session on exactly
            // the same terms as email/password: same rotating refresh token,
            // same lifetime. Without this, Google users would still be the ones
            // getting thrown out overnight.
            var refreshLifetimeDays =
                double.TryParse(config["Jwt:RefreshExpireDays"], out var d) && d > 0 ? d : 30d;
            var refreshExpiry = DateTime.UtcNow.AddDays(refreshLifetimeDays);
            var refreshToken = RefreshTokens.Compose(user.Id, tokenProvider.GenerateRefreshToken());
            await tokenStorage.StoreTokenAsync(user.Id, refreshToken, refreshExpiry);

            return new TokenDto<UserDto>
            {
                Token = token.ToString(),
                Expires = DateTime.Now.AddHours(Convert.ToDouble(config["Jwt:ExpireHours"] ?? "4")),
                RefreshToken = refreshToken,
                RefreshTokenExpires = refreshExpiry,
                User = new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Email = user.Email,
                    EmailConfirmed = user.EmailConfirmed,
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
