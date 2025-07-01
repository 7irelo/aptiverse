using Aptiverse.Marketplace.Application.CourseModules.Dtos;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using AutoMapper;

namespace Aptiverse.Marketplace.Application.CourseModules.Mapping
{
    public class CourseModuleProfile : Profile
    {
        public CourseModuleProfile()
        {
            CreateMap<CourseModule, CourseModuleDto>()
                .ReverseMap();

            CreateMap<CourseModule, CreateCourseModuleDto>()
                .ReverseMap();

            CreateMap<CourseModule, UpdateCourseModuleDto>()
                .ReverseMap()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    srcMember != null && !string.IsNullOrEmpty(srcMember.ToString())));
        }
    }
}