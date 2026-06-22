using Aptiverse.Wellbeing.Application.DiaryEntries.Dtos;
using Aptiverse.Wellbeing.Domain.Models.Wellbeing;
using AutoMapper;

namespace Aptiverse.Wellbeing.Application.DiaryEntries.Mapping
{
    public class DiaryEntryProfile : Profile
    {
        public DiaryEntryProfile()
        {
            CreateMap<DiaryEntry, DiaryEntryDto>().ReverseMap();

            CreateMap<DiaryEntry, CreateDiaryEntryDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<DiaryEntry, UpdateDiaryEntryDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
