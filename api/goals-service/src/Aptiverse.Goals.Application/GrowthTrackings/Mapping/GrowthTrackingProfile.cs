using Aptiverse.Goals.Application.GrowthTrackings.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using AutoMapper;

namespace Aptiverse.Goals.Application.GrowthTrackings.Mapping
{
    public class GrowthTrackingProfile : Profile
    {
        public GrowthTrackingProfile()
        {
            CreateMap<GrowthTracking, GrowthTrackingDto>()
                .ReverseMap();

            CreateMap<GrowthTracking, CreateGrowthTrackingDto>()
                .ReverseMap();

            CreateMap<GrowthTracking, UpdateGrowthTrackingDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));

            CreateMap<GrowthTracking, GrowthTrackingDto>()
                .ForMember(dest => dest.OverallGrowth, opt => opt.MapFrom(src =>
                    (src.AcademicGrowth + src.StudyHabitGrowth + src.EmotionalGrowth) / 3));
        }
    }
}