using Aptiverse.Goals.Application.GoalMilestones.Services;
using Aptiverse.Goals.Application.Goals.Services;
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
            services.AddScoped<IGoalService, GoalService>();
            services.AddScoped<IGoalMilestoneService, GoalMilestoneService>();
            services.AddScoped<IGrowthTrackingService, GrowthTrackingService>();
            services.AddScoped<IPointsTransactionService, PointsTransactionService>();
            services.AddScoped<IRewardService, RewardService>();
            services.AddScoped<IStudentPointsService, StudentPointsService>();
            services.AddScoped<IStudentRewardService, StudentRewardService>();

            return services;
        }
    }
}