using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // Stores Assessment.Tasks as a jsonb column. The Tasks list is a
    // simple checklist owned 1:1 by the assessment — separate table would
    // be overkill. JsonSerializer round-trips List<AssessmentTask>; the
    // value comparer below makes EF detect mutations (otherwise editing
    // a task's `Done` flag wouldn't trigger SaveChanges).
    public class AssessmentConfiguration : IEntityTypeConfiguration<Assessment>
    {
        public void Configure(EntityTypeBuilder<Assessment> builder)
        {
            var comparer = new ValueComparer<List<AssessmentTask>?>(
                (a, b) =>
                    (a == null && b == null) ||
                    (a != null && b != null && a.SequenceEqual(b, new TaskEquality())),
                v => v == null
                    ? 0
                    : v.Aggregate(0, (acc, t) => HashCode.Combine(acc, t.Label, t.Done)),
                v => v == null
                    ? null
                    : v.Select(t => new AssessmentTask { Label = t.Label, Done = t.Done }).ToList());

            builder.Property(a => a.Tasks)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<AssessmentTask>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? null
                        : JsonSerializer.Deserialize<List<AssessmentTask>>(v, (JsonSerializerOptions?)null))
                .Metadata.SetValueComparer(comparer);
        }

        private sealed class TaskEquality : IEqualityComparer<AssessmentTask>
        {
            public bool Equals(AssessmentTask? x, AssessmentTask? y) =>
                x is null ? y is null
                          : y is not null && x.Label == y.Label && x.Done == y.Done;
            public int GetHashCode(AssessmentTask obj) => HashCode.Combine(obj.Label, obj.Done);
        }
    }
}
