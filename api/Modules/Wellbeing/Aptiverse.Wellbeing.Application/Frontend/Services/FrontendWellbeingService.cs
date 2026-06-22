using Aptiverse.Wellbeing.Application.Frontend.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using Aptiverse.Wellbeing.Domain.Repositories;

namespace Aptiverse.Wellbeing.Application.Frontend.Services
{
    // Persistence-backed implementation of the Wellbeing UI surface. Reads and
    // writes DiaryEntry / MoodTracking rows scoped directly to the caller's
    // string identity (StudentId == the userId claim). AI sentiment fields
    // (SentimentAnalysis/SentimentScore/KeyThemes/AiInsights) are intentionally
    // left null/default here — the Python diary_nlp service backfills them out
    // of band.
    public class FrontendWellbeingService(
        IRepository<DiaryEntry> diaryRepository,
        IRepository<MoodTracking> moodRepository) : IFrontendWellbeingService
    {
        public async Task<IList<FrontendDiaryEntryDto>> GetDiaryEntriesAsync(string userId, CancellationToken cancellationToken = default)
        {
            var entries = await diaryRepository.GetManyAsync(
                predicate: e => e.StudentId == userId,
                orderBy: q => q.OrderByDescending(e => e.EntryDate),
                cancellationToken: cancellationToken);

            return [.. entries.Select(ToDiaryDto)];
        }

        public async Task<FrontendDiaryEntryDto> CreateDiaryEntryAsync(string userId, FrontendCreateDiaryEntryInput input, CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var entity = new DiaryEntry
            {
                StudentId = userId,
                Title = string.Empty,
                Content = input.Content ?? string.Empty,
                // Free-text mood label is owned by the AI service; the UI only
                // sends the 1-5 intensity which we persist in MoodIntensity.
                Mood = string.Empty,
                MoodIntensity = Math.Clamp(input.Mood, 1, 5),
                EntryType = "journal",
                Tags = JoinTags(input.Tags),
                IsPrivate = true,
                EntryDate = now,
                // AI sentiment fields left unset (null/default) for diary_nlp.
                NeedsFollowUp = false,
            };

            await diaryRepository.AddAsync(entity, cancellationToken);
            return ToDiaryDto(entity);
        }

        public async Task<IList<FrontendMoodPointDto>> GetMoodTrendAsync(string userId, int days, CancellationToken cancellationToken = default)
        {
            var window = Math.Clamp(days, 1, 365);
            var since = DateTime.UtcNow.Date.AddDays(-(window - 1));

            var rows = await moodRepository.GetManyAsync(
                predicate: m => m.StudentId == userId && m.TrackedAt >= since,
                cancellationToken: cancellationToken);

            // Average the mood score per calendar day so the trend line has at
            // most one point per day even when a student checks in repeatedly.
            return [.. rows
                .GroupBy(m => m.TrackedAt.Date)
                .OrderBy(g => g.Key)
                .Select(g => new FrontendMoodPointDto
                {
                    Date = g.Key,
                    Mood = Math.Round(g.Average(m => (double)m.MoodScore), 2),
                })];
        }

        public async Task<FrontendMoodPointDto> CreateMoodAsync(string userId, FrontendCreateMoodInput input, CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var entity = new MoodTracking
            {
                StudentId = userId,
                Mood = string.Empty,
                MoodScore = Math.Clamp(input.Mood, 1, 5),
                EnergyLevel = input.EnergyLevel ?? string.Empty,
                StressLevel = input.StressLevel ?? string.Empty,
                SleepQuality = input.SleepQuality ?? string.Empty,
                SleepHours = input.SleepHours,
                Triggers = string.Empty,
                CopingStrategies = string.Empty,
                Notes = input.Notes ?? string.Empty,
                TrackedAt = now,
            };

            await moodRepository.AddAsync(entity, cancellationToken);

            return new FrontendMoodPointDto
            {
                Date = entity.TrackedAt.Date,
                Mood = entity.MoodScore,
            };
        }

        public async Task<FrontendWellbeingSummaryDto> GetSummaryAsync(string userId, CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow.Date;
            var sevenDaysAgo = today.AddDays(-6);

            var recent = (await moodRepository.GetManyAsync(
                predicate: m => m.StudentId == userId && m.TrackedAt >= sevenDaysAgo,
                cancellationToken: cancellationToken)).ToList();

            var moodAvg7d = recent.Count > 0
                ? Math.Round(recent.Average(m => (double)m.MoodScore), 2)
                : 0;

            var sleepValues = recent.Where(m => m.SleepHours.HasValue).Select(m => m.SleepHours!.Value).ToList();
            var sleepHours = sleepValues.Count > 0 ? Math.Round(sleepValues.Average(), 1) : 0;

            // Stress signal comes from the most recent check-in's free-text
            // stress level, normalised to the UI's none/low/medium/high band.
            var latest = (await moodRepository.GetManyAsync(
                predicate: m => m.StudentId == userId,
                orderBy: q => q.OrderByDescending(m => m.TrackedAt),
                cancellationToken: cancellationToken)).FirstOrDefault();
            var stressSignal = NormaliseStress(latest?.StressLevel);

            var streak = await ComputeCheckinStreakAsync(userId, today, cancellationToken);

            return new FrontendWellbeingSummaryDto
            {
                MoodAvg7d = moodAvg7d,
                CheckinStreakDays = streak,
                StressSignal = stressSignal,
                SleepHours = sleepHours,
            };
        }

        // Consecutive days (ending today or yesterday) on which the student
        // logged at least one mood check-in. Looks back at most a year.
        private async Task<int> ComputeCheckinStreakAsync(string userId, DateTime today, CancellationToken cancellationToken)
        {
            var lookback = today.AddDays(-365);
            var rows = await moodRepository.GetManyAsync(
                predicate: m => m.StudentId == userId && m.TrackedAt >= lookback,
                cancellationToken: cancellationToken);

            var days = rows.Select(m => m.TrackedAt.Date).ToHashSet();
            if (days.Count == 0) return 0;

            // Anchor the streak to today if there's a check-in today, else to
            // yesterday (a still-active streak the student hasn't logged yet).
            var cursor = days.Contains(today)
                ? today
                : days.Contains(today.AddDays(-1)) ? today.AddDays(-1) : (DateTime?)null;

            if (cursor is null) return 0;

            var streak = 0;
            while (days.Contains(cursor.Value))
            {
                streak++;
                cursor = cursor.Value.AddDays(-1);
            }
            return streak;
        }

        private static FrontendDiaryEntryDto ToDiaryDto(DiaryEntry e) => new()
        {
            Id = e.Id.ToString(),
            Date = e.EntryDate,
            Mood = e.MoodIntensity,
            Content = e.Content ?? string.Empty,
            Tags = SplitTags(e.Tags),
        };

        private static string JoinTags(IList<string>? tags)
            => tags is null || tags.Count == 0
                ? string.Empty
                : string.Join(',', tags.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => t.Trim()));

        private static IList<string> SplitTags(string? tags)
            => string.IsNullOrWhiteSpace(tags)
                ? []
                : [.. tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];

        private static string NormaliseStress(string? stress)
        {
            if (string.IsNullOrWhiteSpace(stress)) return "none";
            return stress.Trim().ToLowerInvariant() switch
            {
                "high" or "severe" or "elevated" => "high",
                "medium" or "moderate" => "medium",
                "low" or "mild" => "low",
                "none" or "calm" => "none",
                _ => "low",
            };
        }
    }
}
