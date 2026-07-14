using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Aptiverse.Practice.Domain.Models.Practice
{
    // Stores PracticeTest.Topics and PracticeTest.Questions as jsonb columns.
    // Both are owned-by-value collections read/written with the test as a unit,
    // so a relational child table would be overkill. The value comparers make
    // EF detect in-place mutation (otherwise editing a question wouldn't dirty
    // the row). Discovered by ApplyConfigurationsFromAssembly in the host.
    public class PracticeTestConfiguration : IEntityTypeConfiguration<PracticeTest>
    {
        public void Configure(EntityTypeBuilder<PracticeTest> builder)
        {
            var topicsComparer = new ValueComparer<List<string>>(
                (a, b) => (a == null && b == null) || (a != null && b != null && a.SequenceEqual(b)),
                v => v == null ? 0 : v.Aggregate(0, (acc, s) => HashCode.Combine(acc, s)),
                v => v == null ? new List<string>() : v.ToList());

            builder.Property(t => t.Topics)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(topicsComparer);

            // Essay marking criteria share the same jsonb string[] treatment.
            builder.Property(t => t.Criteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<string>()
                        : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(topicsComparer);

            var questionsComparer = new ValueComparer<List<PracticeQuestion>>(
                (a, b) =>
                    (a == null && b == null) ||
                    (a != null && b != null && a.Count == b.Count &&
                     a.Select(Serialize).SequenceEqual(b.Select(Serialize))),
                v => v == null ? 0 : v.Aggregate(0, (acc, q) => HashCode.Combine(acc, Serialize(q))),
                v => v == null ? new List<PracticeQuestion>() : v.Select(Clone).ToList());

            builder.Property(t => t.Questions)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<PracticeQuestion>(), (JsonSerializerOptions?)null),
                    v => string.IsNullOrWhiteSpace(v)
                        ? new List<PracticeQuestion>()
                        : JsonSerializer.Deserialize<List<PracticeQuestion>>(v, (JsonSerializerOptions?)null) ?? new List<PracticeQuestion>())
                .Metadata.SetValueComparer(questionsComparer);
        }

        private static string Serialize(PracticeQuestion q) =>
            JsonSerializer.Serialize(q, (JsonSerializerOptions?)null);

        private static PracticeQuestion Clone(PracticeQuestion q) => new()
        {
            Id = q.Id,
            Question = q.Question,
            Kind = q.Kind,
            Options = q.Options.ToList(),
            AnswerIdx = q.AnswerIdx,
            ExpectedAnswer = q.ExpectedAnswer,
            AcceptableAnswers = q.AcceptableAnswers.ToList(),
            Back = q.Back,
            Explanation = q.Explanation,
            Topic = q.Topic,
        };
    }
}
