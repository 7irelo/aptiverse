using Aptiverse.Calendar.Application.Reminders.Dtos;
using Aptiverse.Calendar.Domain.Models.Calendar;
using AutoMapper;

namespace Aptiverse.Calendar.Application.Reminders.Mapping
{
    public class ReminderProfile : Profile
    {
        public ReminderProfile()
        {
            CreateMap<Reminder, ReminderDto>().ReverseMap();

            CreateMap<Reminder, CreateReminderDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<Reminder, UpdateReminderDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
