using Aptiverse.Insights.Application.GradeDistributions.Dtos;
using Aptiverse.Insights.Domain.Models.Insights;
using AutoMapper;

namespace Aptiverse.Insights.Application.GradeDistributions.Mapping
{
    public class GradeDistributionProfile : Profile
    {
        public GradeDistributionProfile()
        {
            CreateMap<GradeDistribution, GradeDistributionDto>().ReverseMap();
            CreateMap<GradeDistribution, CreateGradeDistributionDto>().ReverseMap();

            CreateMap<GradeDistribution, UpdateGradeDistributionDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}