using Aptiverse.Wellbeing.Application.MoodTrackings.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.MoodTrackings.Mapping
{
    public class MoodTrackingProfile : Profile
    {
        public MoodTrackingProfile()
        {
            CreateMap<MoodTracking, MoodTrackingDto>().ReverseMap();

            CreateMap<MoodTracking, CreateMoodTrackingDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<MoodTracking, UpdateMoodTrackingDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
