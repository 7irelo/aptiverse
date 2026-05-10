using Aptiverse.AcademicPlanning.Application.StudentSubjectTopics.Dtos;
using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using AutoMapper;

namespace Aptiverse.AcademicPlanning.Application.StudentSubjectTopics.Mapping
{
    public class StudentSubjectTopicProfile : Profile
    {
        public StudentSubjectTopicProfile()
        {
            CreateMap<StudentSubjectTopic, StudentSubjectTopicDto>().ReverseMap();
            CreateMap<StudentSubjectTopic, CreateStudentSubjectTopicDto>().ReverseMap();

            CreateMap<StudentSubjectTopic, UpdateStudentSubjectTopicDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}