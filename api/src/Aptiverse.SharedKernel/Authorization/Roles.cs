namespace Aptiverse.SharedKernel.Authorization;

public static class Roles
{
    public const string Student = "student";
    public const string Parent = "parent";
    public const string Admin = "admin";

    // Reserved for later phases. No account can hold them yet.
    public const string Tutor = "tutor";
    public const string Teacher = "teacher";
    public const string School = "school";

    /// <summary>The roles a person may choose for themselves at sign-up. Admin is never self-registerable.</summary>
    public static IReadOnlyList<string> SelfRegistrable { get; } = [Student, Parent];

    public static IReadOnlyList<string> Active { get; } = [Student, Parent, Admin];
}
