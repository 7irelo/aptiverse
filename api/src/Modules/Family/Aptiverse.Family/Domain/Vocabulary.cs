namespace Aptiverse.Family.Domain;

// Closed value sets. Each one backs a check constraint and a validator rule, so the database and the API reject
// the same values.

internal static class LinkStatuses
{
    public const string Active = "active";
    public const string Removed = "removed";

    public static IReadOnlyList<string> All { get; } = [Active, Removed];
}

internal static class Relationships
{
    public const string Mother = "mother";
    public const string Father = "father";
    public const string Guardian = "guardian";
    public const string Other = "other";

    public const int MaxLength = 16;

    public static IReadOnlyList<string> All { get; } = [Mother, Father, Guardian, Other];
}

/// <summary>Who ended a link. System means account erasure.</summary>
internal static class RemovedBy
{
    public const string Parent = "parent";
    public const string Student = "student";
    public const string System = "system";

    public static IReadOnlyList<string> All { get; } = [Parent, Student, System];
}

/// <summary>How a link came to exist. Both need the student's action: accepting an invite or handing over a code.</summary>
internal static class LinkMethods
{
    public const string Invite = "invite";
    public const string LinkCode = "link_code";

    public static IReadOnlyList<string> All { get; } = [Invite, LinkCode];
}

internal static class InviteStatuses
{
    public const string Pending = "pending";
    public const string Accepted = "accepted";
    public const string Cancelled = "cancelled";
    public const string Expired = "expired";

    public static IReadOnlyList<string> All { get; } = [Pending, Accepted, Cancelled, Expired];
}

internal static class LinkCodeStatuses
{
    public const string Active = "active";
    public const string Used = "used";

    /// <summary>Replaced by a newer code from the same student.</summary>
    public const string Replaced = "replaced";

    /// <summary>Too many wrong guesses against its selector.</summary>
    public const string Burned = "burned";

    public static IReadOnlyList<string> All { get; } = [Active, Used, Replaced, Burned];
}

internal static class ConsentActions
{
    public const string Granted = "granted";
    public const string Withdrawn = "withdrawn";

    public static IReadOnlyList<string> All { get; } = [Granted, Withdrawn];
}

/// <summary>Who caused a consent row. System means the consenting parent's account was erased.</summary>
internal static class ConsentRecordSources
{
    public const string Parent = "parent";
    public const string System = "system";

    public static IReadOnlyList<string> All { get; } = [Parent, System];
}

/// <summary>A student's parental consent status as a parent or the student sees it.</summary>
internal static class ConsentStatuses
{
    /// <summary>The student is 18 or older.</summary>
    public const string NotRequired = "not_required";

    /// <summary>The student is a minor (or their age is unknown) and no consent is on record.</summary>
    public const string Required = "required";

    public const string Granted = "granted";

    public const string Withdrawn = "withdrawn";
}

/// <summary>Short status and code columns share one length.</summary>
internal static class Codes
{
    public const int MaxLength = 16;
}

/// <summary>Invitee emails are matched on a trimmed, lower-cased form.</summary>
internal static class Emails
{
    public const int MaxLength = 256;

    public static string Normalize(string email)
    {
        ArgumentNullException.ThrowIfNull(email);
        return email.Trim().ToLowerInvariant();
    }

    /// <summary>"j***@g***.com": enough for the sender to recognise, not enough to harvest.</summary>
    public static string Mask(string email)
    {
        ArgumentNullException.ThrowIfNull(email);
        var at = email.LastIndexOf('@');
        if (at <= 0 || at == email.Length - 1)
        {
            return "***";
        }

        var local = email[..at];
        var domain = email[(at + 1)..];
        var dot = domain.LastIndexOf('.');
        var host = dot > 0 ? domain[..dot] : domain;
        var suffix = dot > 0 ? domain[dot..] : string.Empty;
        return $"{local[0]}***@{host[0]}***{suffix}";
    }
}
