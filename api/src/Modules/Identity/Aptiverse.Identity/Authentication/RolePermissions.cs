using System.Collections.Frozen;
using Aptiverse.SharedKernel.Authorization;
using Microsoft.AspNetCore.Authorization;

namespace Aptiverse.Identity.Authentication;

/// <summary>The single role to permission map. Policies, /me and the web app's navigation all derive from it.</summary>
internal static class RolePermissions
{
    private static readonly FrozenDictionary<string, FrozenSet<string>> Map = new Dictionary<string, FrozenSet<string>>
    {
        [Roles.Student] = new[] { Permissions.Account.Manage, Permissions.Notifications.Read }.ToFrozenSet(),
        [Roles.Parent] = new[] { Permissions.Account.Manage, Permissions.Notifications.Read }.ToFrozenSet(),
        [Roles.Admin] = Permissions.All.ToFrozenSet(),
    }.ToFrozenDictionary(StringComparer.Ordinal);

    public static IReadOnlyList<string> For(IEnumerable<string> roles)
    {
        ArgumentNullException.ThrowIfNull(roles);
        return roles
            .SelectMany(r => Map.TryGetValue(r, out var permissions) ? permissions : FrozenSet<string>.Empty)
            .Distinct(StringComparer.Ordinal)
            .Order(StringComparer.Ordinal)
            .ToList();
    }

    public static bool Grants(IEnumerable<string> roles, string permission)
    {
        ArgumentNullException.ThrowIfNull(roles);
        return roles.Any(r => Map.TryGetValue(r, out var permissions) && permissions.Contains(permission));
    }
}

internal sealed record PermissionRequirement(string Permission) : IAuthorizationRequirement;

/// <summary>Grants a permission policy when any role claim in the access token maps to it.</summary>
internal sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var roles = context.User.FindAll(AptiverseClaims.Roles).Select(c => c.Value);
        if (RolePermissions.Grants(roles, requirement.Permission))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
