using Aptiverse.Marketplace.Application.Tutors.Dtos;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using AutoMapper;

namespace Aptiverse.Marketplace.Application.Tutors.Mapping
{
    public class TutorProfile : Profile
    {
        public TutorProfile()
        {
            CreateMap<Tutor, TutorDto>().ReverseMap();
            CreateMap<Tutor, CreateTutorDto>().ReverseMap();

            CreateMap<Tutor, UpdateTutorDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}