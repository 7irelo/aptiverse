using Aptiverse.Calendar.Application.CalendarSyncs.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using AutoMapper;

namespace Aptiverse.Calendar.Application.CalendarSyncs.Mapping
{
    public class CalendarSyncProfile : Profile
    {
        public CalendarSyncProfile()
        {
            CreateMap<CalendarSync, CalendarSyncDto>().ReverseMap();

            CreateMap<CalendarSync, CreateCalendarSyncDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<CalendarSync, UpdateCalendarSyncDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
