using Aptiverse.Moderation.Application.ModerationActions.Dtos;
using Aptiverse.Moderation.Domain.Models.Moderation;
using AutoMapper;

namespace Aptiverse.Moderation.Application.ModerationActions.Mapping
{
    public class ModerationActionProfile : Profile
    {
        public ModerationActionProfile()
        {
            CreateMap<ModerationAction, ModerationActionDto>().ReverseMap();

            CreateMap<ModerationAction, CreateModerationActionDto>()
                .ReverseMap()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<ModerationAction, UpdateModerationActionDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}
