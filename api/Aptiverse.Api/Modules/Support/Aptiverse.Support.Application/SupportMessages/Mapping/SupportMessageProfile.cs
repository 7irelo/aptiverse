using Aptiverse.Support.Application.SupportMessages.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportMessages.Mapping
{
    public class SupportMessageProfile : Profile
    {
        public SupportMessageProfile()
        {
            CreateMap<SupportMessage, SupportMessageDto>().ReverseMap();

            CreateMap<SupportMessage, CreateSupportMessageDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<SupportMessage, UpdateSupportMessageDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
