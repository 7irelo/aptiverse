using Microsoft.AspNetCore.Builder;

namespace Aptiverse.SharedKernel.Authorization;

public static class PermissionEndpointExtensions
{
    public const string PolicyPrefix = "permission:";

    public static string PolicyName(string permission) => PolicyPrefix + permission;

    /// <summary>Requires an authenticated caller whose roles grant <paramref name="permission"/>.</summary>
    public static TBuilder RequirePermission<TBuilder>(this TBuilder builder, string permission)
        where TBuilder : IEndpointConventionBuilder
    {
        ArgumentNullException.ThrowIfNull(builder);
        ArgumentException.ThrowIfNullOrWhiteSpace(permission);
        return builder.RequireAuthorization(PolicyName(permission));
    }
}
