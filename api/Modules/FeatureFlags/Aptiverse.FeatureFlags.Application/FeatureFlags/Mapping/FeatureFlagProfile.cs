using Aptiverse.FeatureFlags.Application.FeatureFlags.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlags.Mapping
{
    public class FeatureFlagProfile : Profile
    {
        public FeatureFlagProfile()
        {
            CreateMap<FeatureFlag, FeatureFlagDto>().ReverseMap();

            CreateMap<FeatureFlag, CreateFeatureFlagDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<FeatureFlag, UpdateFeatureFlagDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
