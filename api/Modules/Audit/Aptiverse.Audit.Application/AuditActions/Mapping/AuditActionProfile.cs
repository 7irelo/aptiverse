using Aptiverse.Audit.Application.AuditActions.Dtos;
using Aptiverse.Audit.Domain.Models.Audit;
using AutoMapper;

namespace Aptiverse.Audit.Application.AuditActions.Mapping
{
    public class AuditActionProfile : Profile
    {
        public AuditActionProfile()
        {
            CreateMap<AuditAction, AuditActionDto>().ReverseMap();

            CreateMap<AuditAction, CreateAuditActionDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<AuditAction, UpdateAuditActionDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
