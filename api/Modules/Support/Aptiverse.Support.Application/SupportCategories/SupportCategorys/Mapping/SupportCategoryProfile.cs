using Aptiverse.Support.Application.SupportCategories.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportCategories.Mapping
{
    public class SupportCategoryProfile : Profile
    {
        public SupportCategoryProfile()
        {
            CreateMap<SupportCategory, SupportCategoryDto>().ReverseMap();

            CreateMap<SupportCategory, CreateSupportCategoryDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<SupportCategory, UpdateSupportCategoryDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
