using Aptiverse.Insights.Application.ImprovementTips.Dtos;
using Aptiverse.Insights.Domain.Models.Insights;
using AutoMapper;

namespace Aptiverse.Insights.Application.ImprovementTips.Mapping
{
    public class ImprovementTipProfile : Profile
    {
        public ImprovementTipProfile()
        {
            CreateMap<ImprovementTip, ImprovementTipDto>().ReverseMap();
            CreateMap<ImprovementTip, CreateImprovementTipDto>().ReverseMap();

            CreateMap<ImprovementTip, UpdateImprovementTipDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}