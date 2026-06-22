using Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Dtos;
using Aptiverse.FeatureFlags.Domain.Models.FeatureFlags;
using AutoMapper;

namespace Aptiverse.FeatureFlags.Application.FeatureFlagEvaluations.Mapping
{
    public class FeatureFlagEvaluationProfile : Profile
    {
        public FeatureFlagEvaluationProfile()
        {
            CreateMap<FeatureFlagEvaluation, FeatureFlagEvaluationDto>().ReverseMap();

            CreateMap<FeatureFlagEvaluation, CreateFeatureFlagEvaluationDto>()
                .ReverseMap()
                .ForMember(dest => dest.EvaluatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<FeatureFlagEvaluation, UpdateFeatureFlagEvaluationDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
