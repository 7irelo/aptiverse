using Aptiverse.Goals.Application.Rewards.Dtos;
using Aptiverse.Goals.Domain.Models.Goals;
using AutoMapper;

namespace Aptiverse.Goals.Application.Rewards.Mapping
{
    public class RewardProfile : Profile
    {
        public RewardProfile()
        {
            CreateMap<Reward, RewardDto>().ReverseMap();
            CreateMap<Reward, CreateRewardDto>().ReverseMap();

            CreateMap<Reward, UpdateRewardDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}