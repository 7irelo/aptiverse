namespace Aptiverse.SharedKernel.Domain;

/// <summary>
/// Base type for every persisted entity. Ids are Guid v7 so they sort by creation time.
/// Timestamps are owned by <see cref="Persistence.AuditableEntityInterceptor"/>; never set them by hand.
/// </summary>
public abstract class Entity
{
    public Guid Id { get; protected init; } = Guid.CreateVersion7();

    public DateTimeOffset CreatedAt { get; internal set; }

    public DateTimeOffset UpdatedAt { get; internal set; }

    public DateTimeOffset? DeletedAt { get; internal set; }

    public bool IsDeleted => DeletedAt is not null;
}
