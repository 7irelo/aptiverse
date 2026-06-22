using Aptiverse.Booking.Application.TutorStudents.Dtos;
using Aptiverse.Booking.Domain.Models.Booking;
using AutoMapper;

namespace Aptiverse.Booking.Application.TutorStudents.Mapping
{
    public class TutorStudentProfile : Profile
    {
        public TutorStudentProfile()
        {
            CreateMap<TutorStudent, TutorStudentDto>().ReverseMap();
            CreateMap<TutorStudent, CreateTutorStudentDto>().ReverseMap();

            CreateMap<TutorStudent, UpdateTutorStudentDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}