using Swashbuckle.AspNetCore.Annotations;
using System.Runtime.Serialization;

namespace Aptiverse.Application.Users.Dtos
{
    [DataContract]
    public class UserDto
    {
        [DataMember(Name = "id")][SwaggerSchema(ReadOnly = true)] public string? Id { get; set; }
        [DataMember(Name = "firstName")] public string? FirstName { get; set; }
        [DataMember(Name = "lastName")] public string? LastName { get; set; }
        [DataMember(Name = "userName")] public string? UserName { get; set; }
        [DataMember(Name = "email")] public string? Email { get; set; }
        [DataMember(Name = "phoneNumber")] public string? PhoneNumber { get; set; }
        [DataMember(Name = "roles")] public IList<string>? Roles { get; set; }

        // Primary normalised role (lowercase snake_case to match the UI's RBAC store).
        [DataMember(Name = "role")] public string? Role { get; set; }

        // Flat list of permission strings the user holds (computed from roles).
        [DataMember(Name = "permissions")] public IList<string>? Permissions { get; set; }

        // Profile metadata for the UI session/header.
        [DataMember(Name = "school")] public string? School { get; set; }
        [DataMember(Name = "grade")] public string? Grade { get; set; }
        [DataMember(Name = "avatarUrl")] public string? AvatarUrl { get; set; }
        [DataMember(Name = "displayName")] public string? DisplayName { get; set; }

        // Feature entitlements — computed from the user's subscription
        // memberships at login time. The frontend's FeatureGuard / useFeature
        // hook read from this list. Refreshed on next login (or whenever the
        // /api/entitlements/me endpoint is called).
        [DataMember(Name = "features")] public IList<string>? Features { get; set; }

        // The user's highest-tier plan code ("free" / "student" / "family" /
        // "school"). Drives the "Upgrade" CTAs on FeatureGuard fallbacks.
        [DataMember(Name = "planCode")] public string? PlanCode { get; set; }
    }
}
