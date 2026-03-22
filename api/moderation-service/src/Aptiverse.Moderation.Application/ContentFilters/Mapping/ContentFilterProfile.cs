using Aptiverse.Moderation.Application.ContentFilters.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ContentFilters.Mapping
{
    public class ContentFilterProfile : Profile
    {
        public ContentFilterProfile()
        {
            CreateMap<ContentFilter, ContentFilterDto>().ReverseMap();

            CreateMap<ContentFilter, CreateContentFilterDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<ContentFilter, UpdateContentFilterDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
