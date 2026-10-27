using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace Aptiverse.Notifications.Delivery;

/// <summary>
/// Deterministic dedupe keys. Identity events carry no event id, so the key is derived from what identifies the
/// event (its type, user and timestamp): every redelivery of that event, by the outbox or by a retry, maps to the
/// same key, while two genuine requests (two reset requests a minute apart) get different keys.
/// </summary>
internal static class DedupeKeys
{
    /// <summary>The key of one occurrence of an event.</summary>
    public static Guid ForEvent(string eventType, Guid userId, DateTimeOffset occurredAt) =>
        Derive(string.Create(CultureInfo.InvariantCulture, $"event|{eventType}|{userId:N}|{occurredAt.UtcTicks}"));

    /// <summary>The key of something a user receives at most once, such as the welcome email.</summary>
    public static Guid OncePerUser(string purpose, Guid userId) =>
        Derive(string.Create(CultureInfo.InvariantCulture, $"once|{purpose}|{userId:N}"));

    // A name-based UUID like v5, but over SHA-256 (RFC 9562 version 8) because SHA-1 is not used in this codebase.
    private static Guid Derive(string name)
    {
        Span<byte> hash = stackalloc byte[SHA256.HashSizeInBytes];
        SHA256.HashData(Encoding.UTF8.GetBytes(name), hash);
        var bytes = hash[..16];
        bytes[6] = (byte)((bytes[6] & 0x0F) | 0x80);
        bytes[8] = (byte)((bytes[8] & 0x3F) | 0x80);
        return new Guid(bytes, bigEndian: true);
    }
}
