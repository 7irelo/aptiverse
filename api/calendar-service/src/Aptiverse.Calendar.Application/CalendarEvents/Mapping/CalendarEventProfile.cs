using Aptiverse.Calendar.Application.CalendarEvents.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using AutoMapper;

namespace Aptiverse.Calendar.Application.CalendarEvents.Mapping
{
    public class CalendarEventProfile : Profile
    {
        public CalendarEventProfile()
        {
            CreateMap<CalendarEvent, CalendarEventDto>().ReverseMap();

            CreateMap<CalendarEvent, CreateCalendarEventDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<CalendarEvent, UpdateCalendarEventDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
