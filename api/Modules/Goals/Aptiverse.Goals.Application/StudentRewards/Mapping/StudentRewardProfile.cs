using Aptiverse.Goals.Application.StudentRewards.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using AutoMapper;

namespace Aptiverse.Goals.Application.StudentRewards.Mapping
{
    public class StudentRewardProfile : Profile
    {
        public StudentRewardProfile()
        {
            CreateMap<StudentReward, StudentRewardDto>().ReverseMap();
            CreateMap<StudentReward, CreateStudentRewardDto>().ReverseMap();

            CreateMap<StudentReward, UpdateStudentRewardDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}