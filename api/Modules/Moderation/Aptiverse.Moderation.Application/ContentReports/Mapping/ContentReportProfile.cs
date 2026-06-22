using Aptiverse.Moderation.Application.ContentReports.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ContentReports.Mapping
{
    public class ContentReportProfile : Profile
    {
        public ContentReportProfile()
        {
            CreateMap<ContentReport, ContentReportDto>().ReverseMap();

            CreateMap<ContentReport, CreateContentReportDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<ContentReport, UpdateContentReportDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
