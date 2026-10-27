using Aptiverse.Family.Persistence;
using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Time;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Family.UnitTests;

internal sealed class FixedClock(DateTimeOffset now) : IClock
{
    public DateTimeOffset UtcNow { get; set; } = now;
}

internal static class TestDb
{
    public static readonly DateTimeOffset Now = new(2026, 10, 28, 9, 41, 17, TimeSpan.Zero);

    public static FamilyDbContext Create(IClock? clock = null)
    {
        var options = new DbContextOptionsBuilder<FamilyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .AddInterceptors(new AuditableEntityInterceptor(clock ?? new FixedClock(Now)))
            .Options;

        return new FamilyDbContext(options);
    }
}
