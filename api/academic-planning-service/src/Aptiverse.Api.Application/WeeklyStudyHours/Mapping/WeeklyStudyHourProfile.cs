using Aptiverse.AcademicPlanning.Application.WeeklyStudyHours.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.WeeklyStudyHours.Mapping
{
    public class WeeklyStudyHourProfile : Profile
    {
        public WeeklyStudyHourProfile()
        {
            CreateMap<WeeklyStudyHour, WeeklyStudyHourDto>().ReverseMap();
            CreateMap<WeeklyStudyHour, CreateWeeklyStudyHourDto>().ReverseMap();

            CreateMap<WeeklyStudyHour, UpdateWeeklyStudyHourDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}