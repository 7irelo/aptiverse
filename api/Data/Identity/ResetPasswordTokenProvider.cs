using Aptiverse.Domain.Models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Aptiverse.Api.Data.Identity
{
    // A dedicated, short-lived token provider for password resets.
    //
    // Identity's default data-protection provider mints every token type with
    // the same lifespan, one day out of the box. That is a long time for a
    // token that can take an account over, and it quietly contradicts the reset
    // email and the reset page, which both tell the user the link expires in 30
    // minutes. Configuring DataProtectionTokenProviderOptions globally would
    // also shorten email-confirmation tokens, where a day is genuinely useful
    // because people confirm an address hours after signing up. So password
    // reset gets its own provider and everything else keeps the default.
    public sealed class ResetPasswordTokenProviderOptions : DataProtectionTokenProviderOptions
    {
        public const string ProviderName = "AptiverseResetPassword";

        public ResetPasswordTokenProviderOptions()
        {
            Name = ProviderName;
            TokenLifespan = TimeSpan.FromMinutes(30);
        }
    }

    public sealed class ResetPasswordTokenProvider<TUser> : DataProtectorTokenProvider<TUser>
        where TUser : class
    {
        public ResetPasswordTokenProvider(
            IDataProtectionProvider dataProtectionProvider,
            IOptions<ResetPasswordTokenProviderOptions> options,
            ILogger<DataProtectorTokenProvider<TUser>> logger)
            : base(dataProtectionProvider, options, logger)
        {
        }
    }
}
