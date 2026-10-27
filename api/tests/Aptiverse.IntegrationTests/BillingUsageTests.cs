using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Aptiverse.Billing.Contracts;
using Aptiverse.Billing.Domain;
using Microsoft.EntityFrameworkCore;
using static Aptiverse.IntegrationTests.BillingTestSupport;

namespace Aptiverse.IntegrationTests;

/// <summary>IUsageMeter: reserve, confirm, refund and expiry, the ledger invariant, and the callers that depend on it.</summary>
[Collection(ApiTestGroup.Name)]
public sealed class BillingUsageTests(ApiFactory factory)
{
    private readonly BillingTestSupport _billing = new(factory);
    private readonly PracticeTestSupport _practice = new(factory);

    private void SkipWithoutDocker() => Assert.SkipUnless(factory.DockerAvailable, factory.DockerUnavailableReason ?? string.Empty);

    [Fact]
    public async Task Reserve_then_confirm_moves_units_to_used_with_the_cost_on_the_ledger()
    {
        SkipWithoutDocker();
        var user = await _billing.StudentAsync();

        var reserved = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.AiQuick, 2, "test:confirm", Ct));
        Assert.Equal(ReserveStatus.Reserved, reserved.Status);
        Assert.Equal(ApiFactory.TestFreeAllowance - 2, reserved.Remaining);
        var held = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiQuick, Ct));
        Assert.Equal((0, 2), (held.Used, held.Reserved));

        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(reserved.ReservationId!.Value, 1, 4_321, Ct)));
        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(reserved.ReservationId!.Value, 1, 4_321, Ct)));

        var after = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiQuick, Ct));
        Assert.Equal((1, 0), (after.Used, after.Reserved));
        var ledger = await _billing.WithDbAsync(db => db.FeatureUsage.AsNoTracking().Where(f => f.ReservationId == reserved.ReservationId).ToListAsync(Ct));
        var row = Assert.Single(ledger);
        Assert.Equal((UsageKinds.Confirm, 1, 4_321L), (row.Kind, row.DeltaUsed, row.CostUsdMicros));
        await AssertLedgerInvariantAsync(user.UserId);
    }

    [Fact]
    public async Task Refund_releases_the_hold_and_resolved_reservations_are_left_alone()
    {
        SkipWithoutDocker();
        var user = await _billing.StudentAsync();
        var first = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.PracticeGenerate, 1, "test:refund", Ct));
        var second = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.PracticeGenerate, 1, "test:refund", Ct));

        Assert.True(await _billing.WithMeterAsync(m => m.RefundAsync(first.ReservationId!.Value, "failed", Ct)));
        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(first.ReservationId!.Value, 1, 0, Ct)));
        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(second.ReservationId!.Value, 1, 0, Ct)));
        Assert.True(await _billing.WithMeterAsync(m => m.RefundAsync(second.ReservationId!.Value, "late", Ct)));
        Assert.False(await _billing.WithMeterAsync(m => m.RefundAsync(Guid.CreateVersion7(), "unknown", Ct)));

        var snapshot = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.PracticeGenerate, Ct));
        Assert.Equal((1, 0), (snapshot.Used, snapshot.Reserved));
        await AssertLedgerInvariantAsync(user.UserId);
    }

    [Fact]
    public async Task An_unresolved_reservation_is_released_by_its_expiry_message_and_a_late_confirm_still_charges()
    {
        SkipWithoutDocker();
        var user = await _billing.StudentAsync();
        var reserved = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.AiHelp, 3, "test:expire", TimeSpan.FromMinutes(1), Ct));
        var id = reserved.ReservationId!.Value;

        // Early delivery is a no-op.
        await _billing.DeliverAsync(new ExpireUsageReservation(id));
        Assert.Equal(3, (await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiHelp, Ct))).Reserved);

        var past = DateTimeOffset.UtcNow.AddMinutes(-1);
        await _billing.WithDbAsync(db => db.UsageReservations.Where(r => r.Id == id).ExecuteUpdateAsync(s => s.SetProperty(r => r.ExpiresAt, past), Ct));
        await _billing.DeliverAsync(new ExpireUsageReservation(id));
        await _billing.DeliverAsync(new ExpireUsageReservation(id));

        var released = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiHelp, Ct));
        Assert.Equal((0, 0), (released.Used, released.Reserved));
        Assert.Equal(ReservationStatuses.Expired, await _billing.WithDbAsync(db => db.UsageReservations.Where(r => r.Id == id).Select(r => r.Status).SingleAsync(Ct)));

        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(id, 3, 0, Ct)));
        var charged = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiHelp, Ct));
        Assert.Equal((3, 0), (charged.Used, charged.Reserved));
        await AssertLedgerInvariantAsync(user.UserId);
    }

    [Fact]
    public async Task Parallel_reservations_never_overshoot_the_limit()
    {
        SkipWithoutDocker();
        var user = await _billing.StudentAsync();
        var filler = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.AiQuick, ApiFactory.TestFreeAllowance - 10, "test:fill", Ct));
        Assert.True(await _billing.WithMeterAsync(m => m.ConfirmAsync(filler.ReservationId!.Value, ApiFactory.TestFreeAllowance - 10, 0, Ct)));

        var outcomes = await Task.WhenAll(Enumerable.Range(0, 30).Select(_ =>
            _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.AiQuick, 1, "test:race", Ct))));

        Assert.Equal(10, outcomes.Count(o => o.Status == ReserveStatus.Reserved));
        Assert.Equal(20, outcomes.Count(o => o.Status == ReserveStatus.Exhausted));
        var exhausted = outcomes.First(o => o.Status == ReserveStatus.Exhausted);
        Assert.True(exhausted.ResetsAt > DateTimeOffset.UtcNow);
        var snapshot = await _billing.WithMeterAsync(m => m.GetAsync(user.UserId, QuotaKeys.AiQuick, Ct));
        Assert.Equal(ApiFactory.TestFreeAllowance, snapshot.Used + snapshot.Reserved);
    }

    [Fact]
    public async Task Usage_route_shows_every_quota_for_the_caller()
    {
        SkipWithoutDocker();
        var user = await _billing.StudentAsync();
        var reserved = await _billing.WithMeterAsync(m => m.ReserveAsync(user.UserId, QuotaKeys.PracticeGenerate, 1, "test:usage", Ct));
        await _billing.WithMeterAsync(m => m.ConfirmAsync(reserved.ReservationId!.Value, 1, 0, Ct));

        using var json = JsonDocument.Parse(await user.Client.GetStringAsync("/billing/usage", Ct));
        var items = json.RootElement.GetProperty("items").EnumerateArray().ToDictionary(i => i.GetProperty("quotaKey").GetString()!);

        Assert.Equal(QuotaKeys.All.Order(StringComparer.Ordinal), items.Keys.Order(StringComparer.Ordinal));
        Assert.Equal(1, items[QuotaKeys.PracticeGenerate].GetProperty("used").GetInt32());
        Assert.Equal(ApiFactory.TestFreeAllowance, items[QuotaKeys.PracticeGenerate].GetProperty("limit").GetInt32());
    }

    [Fact]
    public async Task Exhausted_practice_allowance_blocks_generation_with_429_and_nothing_is_created()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        await _billing.ExhaustAsync(student.UserId, QuotaKeys.PracticeGenerate);
        var aiCalls = factory.AiStub.For("/v1/generations").Count();

        var response = await _practice.GenerateAsync(student);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        Assert.Equal("practice.quota_exhausted", problem.RootElement.GetProperty("code").GetString());
        Assert.Equal(QuotaKeys.PracticeGenerate, problem.RootElement.GetProperty("quotaKey").GetString());
        Assert.True(problem.RootElement.TryGetProperty("resetsAt", out _));
        Assert.Equal(aiCalls, factory.AiStub.For("/v1/generations").Count());
        await _practice.WithDbAsync(async db => Assert.False(await db.Tests.AnyAsync(t => t.UserId == student.UserId, Ct)));
    }

    [Fact]
    public async Task Practice_generation_confirms_on_success_and_refunds_on_failure()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();

        var (_, okJob) = await PracticeTestSupport.AcceptedAsync(await _practice.GenerateAsync(student));
        await _practice.PollAsync(okJob);
        var (_, failJob) = await PracticeTestSupport.AcceptedAsync(await _practice.GenerateAsync(student, topics: [Generation.Fail]));
        await _practice.PollAsync(failJob);

        var reservations = new Dictionary<Guid, Guid?>();
        await _practice.WithDbAsync(async db =>
        {
            foreach (var job in await db.GenerationJobs.AsNoTracking().Where(j => j.UserId == student.UserId).ToListAsync(Ct))
            {
                reservations[job.Id] = job.QuotaReservationId;
            }
        });

        await _billing.WithDbAsync(async db =>
        {
            Assert.Equal(ReservationStatuses.Confirmed, await db.UsageReservations.Where(r => r.Id == reservations[okJob]).Select(r => r.Status).SingleAsync(Ct));
            Assert.Equal(ReservationStatuses.Refunded, await db.UsageReservations.Where(r => r.Id == reservations[failJob]).Select(r => r.Status).SingleAsync(Ct));
        });
        var snapshot = await _billing.WithMeterAsync(m => m.GetAsync(student.UserId, QuotaKeys.PracticeGenerate, Ct));
        Assert.Equal((1, 0), (snapshot.Used, snapshot.Reserved));
    }

    [Fact]
    public async Task A_refused_generation_gives_its_reservation_back()
    {
        SkipWithoutDocker();
        var student = await _practice.HighSchoolStudentAsync();
        await PracticeTestSupport.AcceptedAsync(await _practice.GenerateAsync(student, topics: [Generation.Slow]));

        // One generation at a time: the second is refused after its reservation, which must be refunded.
        var second = await _practice.GenerateAsync(student);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);

        var snapshot = await _billing.WithMeterAsync(m => m.GetAsync(student.UserId, QuotaKeys.PracticeGenerate, Ct));
        Assert.Equal((0, 1), (snapshot.Used, snapshot.Reserved));
    }

    [Fact]
    public async Task Tutor_messages_reserve_confirm_with_the_reported_cost_refund_on_failure_and_stop_when_exhausted()
    {
        SkipWithoutDocker();
        var academics = new AcademicsTestSupport(factory);
        var (userId, client) = await academics.HighSchoolAsync();
        var conversation = await CreateConversationAsync(client);

        var ok = await client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Explain photosynthesis" }, Ct);
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        await ok.Content.ReadAsStringAsync(Ct);
        var broken = await client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "Please [error]" }, Ct);
        await broken.Content.ReadAsStringAsync(Ct);

        var rows = await _billing.WithDbAsync(db => db.UsageReservations.AsNoTracking().Where(r => r.UserId == userId).OrderBy(r => r.CreatedAt).ToListAsync(Ct));
        Assert.Equal([ReservationStatuses.Confirmed, ReservationStatuses.Refunded], rows.Select(r => r.Status));
        Assert.All(rows, r => Assert.Equal(QuotaKeys.AiQuick, r.QuotaKey));
        var confirm = await _billing.WithDbAsync(db => db.FeatureUsage.AsNoTracking().SingleAsync(f => f.ReservationId == rows[0].Id, Ct));
        Assert.Equal(StubAiService.CostUsdMicros, confirm.CostUsdMicros);

        await _billing.ExhaustAsync(userId, QuotaKeys.AiQuick);
        var calls = factory.AiStub.For("/v1/tutor/turn").Count();
        var limited = await client.PostAsJsonAsync($"/ai/conversations/{conversation}/messages", new { message = "One more" }, Ct);
        Assert.Equal(HttpStatusCode.TooManyRequests, limited.StatusCode);
        Assert.Equal("ai.quota_exhausted", await ProblemCodeAsync(limited));
        Assert.Equal(calls, factory.AiStub.For("/v1/tutor/turn").Count());
        await AssertLedgerInvariantAsync(userId);
    }

    private static async Task<Guid> CreateConversationAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync("/ai/conversations", new { title = "Quota" }, Ct);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(Ct));
        return json.RootElement.GetProperty("id").GetGuid();
    }

    /// <summary>For every meter of the user, used equals the sum of the usage ledger's delta_used.</summary>
    private async Task AssertLedgerInvariantAsync(Guid userId) =>
        await _billing.WithDbAsync(async db =>
        {
            foreach (var meter in await db.UsageMeters.AsNoTracking().Where(m => m.SubjectId == userId).ToListAsync(Ct))
            {
                var sum = await db.FeatureUsage.Where(f => f.MeterId == meter.Id).SumAsync(f => (int?)f.DeltaUsed, Ct) ?? 0;
                Assert.Equal(meter.Used, sum);
            }
        });
}
