using Aptiverse.Support.Application.SupportTickets.Dtos;
using Aptiverse.Support.Domain.Models.Support;
using AutoMapper;

namespace Aptiverse.Support.Application.SupportTickets.Mapping
{
    public class SupportTicketProfile : Profile
    {
        public SupportTicketProfile()
        {
            CreateMap<SupportTicket, SupportTicketDto>().ReverseMap();

            CreateMap<SupportTicket, CreateSupportTicketDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<SupportTicket, UpdateSupportTicketDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
