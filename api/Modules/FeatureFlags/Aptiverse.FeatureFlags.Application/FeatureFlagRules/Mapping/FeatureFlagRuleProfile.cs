using Aptiverse.FeatureFlags.Application.FeatureFlagRules.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagRules.Mapping
{
    public class FeatureFlagRuleProfile : Profile
    {
        public FeatureFlagRuleProfile()
        {
            CreateMap<FeatureFlagRule, FeatureFlagRuleDto>().ReverseMap();

            CreateMap<FeatureFlagRule, CreateFeatureFlagRuleDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<FeatureFlagRule, UpdateFeatureFlagRuleDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
