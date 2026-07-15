// Per-module Application-layer DI registration for the unified host.
//
// Each module's `AddApplicationServices()` is an extension method on
// IServiceCollection — they share the same name across modules, so we
// invoke them as static methods with explicit namespaces to avoid the
// CS0121 ambiguity error.
//
// DbContext, Identity, Redis, generic Repository<T>, and email plumbing
// are wired once in Aptiverse.Api.Data.InfrastructureRegistrations —
// not here.

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Api.Modules
{
    public static class ModuleRegistrations
    {
        public static IServiceCollection RegisterDomainModules(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            Aptiverse.AcademicPlanning.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Audit.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Booking.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Calendar.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Entitlements.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            // Events (transactional outbox): registers scoped IEventPublisher ->
            // EventPublisher AND AddHostedService<OutboxDispatcher>. The hosted
            // dispatcher is registered ONLY here (AddHostedService is not
            // idempotent — a second registration would run a duplicate).
            Aptiverse.Events.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.FeatureFlags.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Goals.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Insights.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Marketplace.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Mastery.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Moderation.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Notifications.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Practice.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Support.Application.ServiceCollectionExtensions.AddApplicationServices(services);
            Aptiverse.Wellbeing.Application.ServiceCollectionExtensions.AddApplicationServices(services);

            // Goal verification reads across Practice, AcademicPlanning and
            // Wellbeing, so it can't live inside any one module's Application
            // library without those libraries referencing each other. It's
            // registered here, in the host, which is the only place allowed to
            // see all three. Scoped: it shares the request's DbContext, so its
            // writes commit with whatever else that request is doing.
            services.AddScoped<Aptiverse.Api.Services.Goals.GoalEvaluator>();
            return services;
        }
    }
}
