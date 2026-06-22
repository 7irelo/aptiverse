using Aptiverse.Mastery.Application.KnowledgeGaps.Dtos;
using Aptiverse.Mastery.Domain.Models.Mastery;
using AutoMapper;

namespace Aptiverse.Mastery.Application.KnowledgeGaps.Mapping
{
    public class KnowledgeGapProfile : Profile
    {
        public KnowledgeGapProfile()
        {
            CreateMap<KnowledgeGap, KnowledgeGapDto>().ReverseMap();
            CreateMap<KnowledgeGap, CreateKnowledgeGapDto>().ReverseMap();

            CreateMap<KnowledgeGap, UpdateKnowledgeGapDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}