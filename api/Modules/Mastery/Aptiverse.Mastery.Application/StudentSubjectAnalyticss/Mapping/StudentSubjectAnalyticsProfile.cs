using Aptiverse.Mastery.Application.StudentSubjectAnalyticss.Dtos;
using Aptiverse.Mastery.Domain.Models.Mastery;
using AutoMapper;

namespace Aptiverse.Mastery.Application.StudentSubjectAnalyticss.Mapping
{
    public class StudentSubjectAnalyticsProfile : Profile
    {
        public StudentSubjectAnalyticsProfile()
        {
            CreateMap<StudentSubjectAnalytics, StudentSubjectAnalyticsDto>().ReverseMap();
            CreateMap<StudentSubjectAnalytics, CreateStudentSubjectAnalyticsDto>().ReverseMap();

            CreateMap<StudentSubjectAnalytics, UpdateStudentSubjectAnalyticsDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}