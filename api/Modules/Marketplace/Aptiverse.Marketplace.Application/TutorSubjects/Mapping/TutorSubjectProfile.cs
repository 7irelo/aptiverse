using Aptiverse.Marketplace.Application.TutorSubjects.Dtos;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using AutoMapper;

namespace Aptiverse.Marketplace.Application.TutorSubjects.Mapping
{
    public class TutorSubjectProfile : Profile
    {
        public TutorSubjectProfile()
        {
            CreateMap<TutorSubject, TutorSubjectDto>().ReverseMap();
            CreateMap<TutorSubject, CreateTutorSubjectDto>().ReverseMap();

            CreateMap<TutorSubject, UpdateTutorSubjectDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}