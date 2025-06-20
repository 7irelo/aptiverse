using Aptiverse.AcademicPlanning.Application.StudySessions.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.StudySessions.Mapping
{
    public class StudySessionProfile : Profile
    {
        public StudySessionProfile()
        {
            CreateMap<StudySession, StudySessionDto>().ReverseMap();
            CreateMap<StudySession, CreateStudySessionDto>().ReverseMap();

            CreateMap<StudySession, UpdateStudySessionDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}