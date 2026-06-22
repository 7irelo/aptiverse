using Aptiverse.Application.Auth.Dtos;
using Aptiverse.Domain.Models;
using AutoMapper;

namespace Aptiverse.Application.Auth.Mapping
{
    public class AuthProfile : Profile
    {
        public AuthProfile()
        {
            // Identity requires UserName; we just use the email so users
            // never have to invent a separate handle.
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email));
        }
    }
}
