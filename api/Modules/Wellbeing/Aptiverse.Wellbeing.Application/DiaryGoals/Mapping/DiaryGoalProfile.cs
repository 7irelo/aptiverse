using Aptiverse.Wellbeing.Application.DiaryGoals.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.DiaryGoals.Mapping
{
    public class DiaryGoalProfile : Profile
    {
        public DiaryGoalProfile()
        {
            CreateMap<DiaryGoal, DiaryGoalDto>().ReverseMap();

            CreateMap<DiaryGoal, CreateDiaryGoalDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<DiaryGoal, UpdateDiaryGoalDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
