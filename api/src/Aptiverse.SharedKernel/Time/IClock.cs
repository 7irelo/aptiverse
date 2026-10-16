namespace Aptiverse.SharedKernel.Time;

/// <summary>Use instead of DateTime.Now / DateTimeOffset.UtcNow so time is testable. Always UTC.</summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
