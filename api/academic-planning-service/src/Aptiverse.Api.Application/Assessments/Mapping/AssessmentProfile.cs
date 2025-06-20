using Aptiverse.AcademicPlanning.Application.Assessments.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.Assessments.Mapping
{
    public class AssessmentProfile : Profile
    {
        public AssessmentProfile()
        {
            CreateMap<Assessment, AssessmentDto>()
                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.Subject != null ? src.Subject.Name : null))
                .ReverseMap();

            CreateMap<Assessment, CreateAssessmentDto>().ReverseMap();

            CreateMap<Assessment, UpdateAssessmentDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}