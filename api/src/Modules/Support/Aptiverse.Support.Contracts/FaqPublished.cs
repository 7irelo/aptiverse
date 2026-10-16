namespace Aptiverse.Support.Contracts;

/// <summary>Integration event raised (through the outbox) when a published FAQ is created.</summary>
public sealed record FaqPublished(Guid FaqId, string Category, DateTimeOffset OccurredAt);
