using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Stores AttemptScoreSummary.PerTopic as a jsonb column. The per-topic
    // rollup is read/written as a unit with the summary, so a child table
    // would be needless. Value comparer makes EF detect mutation. Discovered
    // by ApplyConfigurationsFromAssembly in the host.
    public class AttemptScoreSummaryConfiguration : IEntityTypeConfiguration<AttemptScoreSummary>
    {
        public void Configure(EntityTypeBuilder<AttemptScoreSummary> builder)
        {
            var comparer = new ValueComparer<List<TopicScore>>(
                (a, b) =>
                    (a == null && b == null) ||
                    (a != null && b != null && a.Count == b.Count &&
                     a.Select(Serialize).SequenceEqual(b.Select(Serialize))),
                v => v == null ? 0 : v.Aggregate(0, (acc, t) => HashCode.Combine(acc, Serialize(t))),
                v => v == null ? new List<TopicScore>() : v.Select(Clone).ToList());

            builder.Property(s => s.PerTopic)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<TopicScore>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<TopicScore>()
                        : JsonSerializer.Deserialize<List<TopicScore>>(v, (JsonSerializerOptions?)null) ?? new List<TopicScore>())
                .Metadata.SetValueComparer(comparer);
        }

        private static string Serialize(TopicScore t) =>
            JsonSerializer.Serialize(t, (JsonSerializerOptions?)null);

        private static TopicScore Clone(TopicScore t) => new()
        {
            Topic = t.Topic,
            Correct = t.Correct,
            Total = t.Total,
            Percent = t.Percent,
        };
    }
}
