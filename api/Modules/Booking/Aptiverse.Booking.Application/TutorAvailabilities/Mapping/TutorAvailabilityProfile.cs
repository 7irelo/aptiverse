using Aptiverse.Booking.Application.TutorAvailabilities.Dtos;
using Aptiverse.Booking.Domain.Models.Booking;
using AutoMapper;

namespace Aptiverse.Booking.Application.TutorAvailabilities.Mapping
{
    public class TutorAvailabilityProfile : Profile
    {
        public TutorAvailabilityProfile()
        {
            CreateMap<TutorAvailability, TutorAvailabilityDto>().ReverseMap();
            CreateMap<TutorAvailability, CreateTutorAvailabilityDto>().ReverseMap();

            CreateMap<TutorAvailability, UpdateTutorAvailabilityDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}