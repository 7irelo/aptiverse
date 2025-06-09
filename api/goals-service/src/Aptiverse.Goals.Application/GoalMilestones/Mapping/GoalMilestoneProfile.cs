using Aptiverse.Goals.Application.GoalMilestones.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using AutoMapper;

namespace Aptiverse.Goals.Application.GoalMilestones.Mapping
{
    public class GoalMilestoneProfile : Profile
    {
        public GoalMilestoneProfile()
        {
            CreateMap<GoalMilestone, GoalMilestoneDto>()
                .ReverseMap();

            CreateMap<GoalMilestone, CreateGoalMilestoneDto>()
                .ReverseMap();

            CreateMap<GoalMilestone, UpdateGoalMilestoneDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}