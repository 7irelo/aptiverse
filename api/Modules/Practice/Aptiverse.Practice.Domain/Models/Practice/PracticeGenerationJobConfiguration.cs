using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Stores PracticeGenerationJob.Topics as a jsonb column, matching the
    // treatment PracticeTestConfiguration gives the test's own Topics. A
    // malformed value degrades to an empty list rather than throwing on read,
    // for the same reason it does there: one bad row should not take out the
    // poll endpoint for a job that is otherwise fine.
    public class PracticeGenerationJobConfiguration : IEntityTypeConfiguration<PracticeGenerationJob>
    {
        public void Configure(EntityTypeBuilder<PracticeGenerationJob> builder)
        {
            var comparer = new ValueComparer<List<string>>(
                (a, b) => (a == null && b == null) || (a != null && b != null && a.SequenceEqual(b)),
                v => v == null ? 0 : v.Aggregate(0, (acc, s) => HashCode.Combine(acc, s)),
                v => v == null ? new List<string>() : v.ToList());

            builder.Property(j => j.Topics)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions?)null),
                    v => ReadStringList(v))
                .Metadata.SetValueComparer(comparer);
        }

        private static List<string> ReadStringList(string? v)
        {
            if (string.IsNullOrWhiteSpace(v)) return new List<string>();
            try
            {
                return JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null)
                       ?? new List<string>();
            }
            catch (JsonException)
            {
                return new List<string>();
            }
        }
    }
}
