using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.AI.Domain.Models
{
    // Stores TutorConversation.Messages as a jsonb column. The value comparer
    // makes EF detect in-place mutation of the list (otherwise appending a turn
    // wouldn't dirty the row). Discovered by ApplyConfigurationsFromAssembly.
    public class TutorConversationConfiguration : IEntityTypeConfiguration<TutorConversation>
    {
        public void Configure(EntityTypeBuilder<TutorConversation> builder)
        {
            var comparer = new ValueComparer<List<TutorConversationMessage>>(
                (a, b) =>
                    (a == null && b == null) ||
                    (a != null && b != null && a.Count == b.Count &&
                     a.Select(Serialize).SequenceEqual(b.Select(Serialize))),
                v => v == null ? 0 : v.Aggregate(0, (acc, m) => HashCode.Combine(acc, Serialize(m))),
                v => v == null ? new List<TutorConversationMessage>() : v.Select(Clone).ToList());

            builder.Property(c => c.Messages)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<TutorConversationMessage>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<TutorConversationMessage>()
                        : JsonSerializer.Deserialize<List<TutorConversationMessage>>(v, (JsonSerializerOptions?)null) ?? new List<TutorConversationMessage>())
                .Metadata.SetValueComparer(comparer);

            builder.Property(c => c.Title).HasMaxLength(200);
            builder.HasIndex(c => new { c.StudentId, c.UpdatedAt });
        }

        private static string Serialize(TutorConversationMessage m) =>
            JsonSerializer.Serialize(m, (JsonSerializerOptions?)null);

        private static TutorConversationMessage Clone(TutorConversationMessage m) => new()
        {
            Role = m.Role,
            Content = m.Content,
        };
    }
}
