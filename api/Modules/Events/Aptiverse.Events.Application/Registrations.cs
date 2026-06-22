using Aptiverse.Events.Application.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Aptiverse.Events.Application
{
    public static class ServiceCollectionExtensions
    {
        // Registers the Events (transactional-outbox) module.
        //
        // IEventPublisher is the producer side: other modules inject it to
        // stage an OutboxMessage inside their own SaveChanges transaction.
        // Scoped so it shares the caller's ApplicationDbContext instance.
        //
        // The OutboxDispatcher hosted service is the consumer side: it
        // polls unprocessed rows and republishes to Redis pub/sub. It is
        // registered HERE via AddHostedService, which runs exactly once
        // because RegisterDomainModules calls this method once. Do NOT also
        // add a separate AddHostedService<OutboxDispatcher>() in host wiring
        // — AddHostedService is not idempotent and a second registration
        // would run a duplicate dispatcher.
        //
        // TryAdd on the scoped publisher so re-registration is a no-op
        // rather than a duplicate, mirroring the Notifications module.
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.TryAddScoped<IEventPublisher, EventPublisher>();
            services.AddHostedService<OutboxDispatcher>();
            return services;
        }
    }
}
