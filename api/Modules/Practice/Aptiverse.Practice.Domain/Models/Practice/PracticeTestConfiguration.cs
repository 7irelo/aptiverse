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
                    v => ReadStringList(v))
                .Metadata.SetValueComparer(topicsComparer);

            // Essay marking criteria share the same jsonb string[] treatment.
            builder.Property(t => t.Criteria)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? new List<string>(), (JsonSerializerOptions?)null),
                    v => ReadStringList(v))
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
                    v => ReadQuestionList(v))
                .Metadata.SetValueComparer(questionsComparer);
        }

        // Reads a jsonb string[] column without letting one bad row take down a
        // whole endpoint.
        //
        // AddPracticeContentFormats added `criteria` as jsonb NOT NULL DEFAULT ''.
        // EF turned that empty string into the jsonb value `""` — legal jsonb, but
        // a string, not an array — so every pre-existing row deserialised straight
        // into a JsonException and GET /api/practice/tests returned 500 for the
        // entire list. A single malformed row should degrade to an empty list, not
        // break the collection around it. The accompanying migration repairs the
        // stored values and the default; this keeps the read path honest regardless.
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

        // Same contract as ReadStringList, for the questions payload.
        private static List<PracticeQuestion> ReadQuestionList(string? v)
        {
            if (string.IsNullOrWhiteSpace(v)) return new List<PracticeQuestion>();
            try
            {
                return JsonSerializer.Deserialize<List<PracticeQuestion>>(v, (JsonSerializerOptions?)null)
                       ?? new List<PracticeQuestion>();
            }
            catch (JsonException)
            {
                return new List<PracticeQuestion>();
            }
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
