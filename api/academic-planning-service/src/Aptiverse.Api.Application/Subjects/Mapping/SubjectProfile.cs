using Aptiverse.AcademicPlanning.Application.Subjects.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.Subjects.Mapping
{
    public class SubjectProfile : Profile
    {
        public SubjectProfile()
        {
            CreateMap<Subject, SubjectDto>().ReverseMap();
            CreateMap<Subject, CreateSubjectDto>().ReverseMap();

            CreateMap<Subject, UpdateSubjectDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}