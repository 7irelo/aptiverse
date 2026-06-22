using Aptiverse.Audit.Application.AuditLogs.Dtos;
using Aptiverse.Audit.Domain.Models.Audit;
using AutoMapper;

namespace Aptiverse.Audit.Application.AuditLogs.Mapping
{
    public class AuditLogProfile : Profile
    {
        public AuditLogProfile()
        {
            CreateMap<AuditLog, AuditLogDto>().ReverseMap();

            CreateMap<AuditLog, CreateAuditLogDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<AuditLog, UpdateAuditLogDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
