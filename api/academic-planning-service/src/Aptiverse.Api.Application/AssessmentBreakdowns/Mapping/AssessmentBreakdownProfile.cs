using Aptiverse.AcademicPlanning.Application.AssessmentBreakdowns.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.AssessmentBreakdowns.Mapping
{
    public class AssessmentBreakdownProfile : Profile
    {
        public AssessmentBreakdownProfile()
        {
            CreateMap<AssessmentBreakdown, AssessmentBreakdownDto>()
                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.StudentSubject != null &&
                                             src.StudentSubject.Subject != null ?
                                             src.StudentSubject.Subject.Name : null))
                .ReverseMap();

            CreateMap<AssessmentBreakdown, CreateAssessmentBreakdownDto>().ReverseMap();

            CreateMap<AssessmentBreakdown, UpdateAssessmentBreakdownDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}