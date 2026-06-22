using Aptiverse.Goals.Application.GrowthTrackings.Services;
using Aptiverse.Goals.Application.PointsTransactions.Services;
using Aptiverse.Goals.Application.Rewards.Services;
using Aptiverse.Goals.Application.StudentPointss.Services;
using Aptiverse.Goals.Application.StudentRewards.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Aptiverse.Goals.Application
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // GoalService and GoalMilestoneService were scaffolding for a
            // pre-modulith architecture. The current GoalsController in
            // Aptiverse.Api talks to ApplicationDbContext directly — those
            // services aren't called by anything live and were dropped.
            services.AddScoped<IGrowthTrackingService, GrowthTrackingService>();
            services.AddScoped<IPointsTransactionService, PointsTransactionService>();
            services.AddScoped<IRewardService, RewardService>();
            services.AddScoped<IStudentPointsService, StudentPointsService>();
            services.AddScoped<IStudentRewardService, StudentRewardService>();

            return services;
        }
    }
}
