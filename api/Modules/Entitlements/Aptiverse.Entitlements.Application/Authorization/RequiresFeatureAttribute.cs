using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Aptiverse.Entitlements.Application.Authorization
{
    // Server-side gate. Reads the `features` claims set on the JWT at
    // login time and 402 Payment Required's anything the user hasn't
    // got entitlement for. 402 (rather than 403) so the UI can
    // distinguish "you're not allowed" from "your plan doesn't include
    // this — upgrade".
    //
    // Usage:
    //   [RequiresFeature("ai_practice.unlimited")]
    //   [HttpPost("tests/{id}/attempts")]
    //   public async Task<...> StartAttempt(...) { ... }
    //
    // Multiple features → ALL required (use multiple attributes for OR).
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public sealed class RequiresFeatureAttribute(string featureKey) : Attribute, IAuthorizationFilter
    {
        public string FeatureKey { get; } = featureKey;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user.Identity?.IsAuthenticated != true)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var features = user.FindAll("features").Select(c => c.Value).ToHashSet(StringComparer.OrdinalIgnoreCase);
            if (!features.Contains(FeatureKey))
            {
                context.Result = new ObjectResult(new
                {
                    error = "feature_not_entitled",
                    feature = FeatureKey,
                    message = $"Your plan doesn't include '{FeatureKey}'. Upgrade to use this.",
                })
                {
                    StatusCode = StatusCodes.Status402PaymentRequired,
                };
            }
        }
    }
}
