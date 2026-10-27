using System.Reflection;

namespace Aptiverse.SharedKernel.Authorization;

/// <summary>
/// Every permission the API enforces. Each constant becomes an authorization policy, and endpoints opt in with
/// <see cref="PermissionEndpointExtensions.RequirePermission{TBuilder}"/>. Which role holds which permission is
/// decided in one place, the Identity module's role map. A permission that gates nothing does not belong here.
/// </summary>
public static class Permissions
{
    public static class Account
    {
        /// <summary>Read and change your own profile, onboarding, password and preferences.</summary>
        public const string Manage = "account.manage";
    }

    public static class Notifications
    {
        public const string Read = "notifications.read";
    }

    public static class Audit
    {
        /// <summary>Read the security event log of every account.</summary>
        public const string Read = "audit.read";
    }

    public static class Content
    {
        /// <summary>Write help content: FAQs, articles and past paper links (support.faqs.manage folded in, decision 9b).</summary>
        public const string Manage = "content.manage";
    }

    public static class Ai
    {
        /// <summary>Chat with the AI tutor in your own conversations.</summary>
        public const string Chat = "ai.chat";
    }

    public static class Academics
    {
        /// <summary>Manage your own study units (subjects or courses), their topics and your assessments and marks.</summary>
        public const string Manage = "academics.manage";
    }

    public static IReadOnlyList<string> All { get; } = typeof(Permissions)
        .GetNestedTypes(BindingFlags.Public | BindingFlags.Static)
        .SelectMany(t => t.GetFields(BindingFlags.Public | BindingFlags.Static))
        .Where(f => f.IsLiteral && f.FieldType == typeof(string))
        .Select(f => (string)f.GetRawConstantValue()!)
        .Order(StringComparer.Ordinal)
        .ToArray();
}
