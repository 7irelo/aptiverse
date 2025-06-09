using Aptiverse.Goals.Application.StudentPointss.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using AutoMapper;

namespace Aptiverse.Goals.Application.StudentPointss.Mapping
{
    public class StudentPointsProfile : Profile
    {
        public StudentPointsProfile()
        {
            CreateMap<StudentPoints, StudentPointsDto>().ReverseMap();
            CreateMap<StudentPoints, CreateStudentPointsDto>().ReverseMap();

            CreateMap<StudentPoints, UpdateStudentPointsDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}