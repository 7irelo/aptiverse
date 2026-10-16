using Aptiverse.SharedKernel.Persistence;
using Aptiverse.SharedKernel.Time;
using Aptiverse.Support.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Support.UnitTests;

internal sealed class FixedClock(DateTimeOffset now) : IClock
{
    public DateTimeOffset UtcNow { get; set; } = now;
}

internal static class TestDb
{
    public static readonly DateTimeOffset Now = new(2026, 3, 1, 8, 0, 0, TimeSpan.Zero);

    public static SupportDbContext Create(IClock? clock = null)
    {
        var options = new DbContextOptionsBuilder<SupportDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .AddInterceptors(new AuditableEntityInterceptor(clock ?? new FixedClock(Now)))
            .Options;

        return new SupportDbContext(options);
    }
}
