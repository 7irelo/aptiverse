using Aptiverse.Marketplace.Application.ResourceDownloads.Dtos;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using AutoMapper;

namespace Aptiverse.Marketplace.Application.ResourceDownloads.Mapping
{
    public class ResourceDownloadProfile : Profile
    {
        public ResourceDownloadProfile()
        {
            CreateMap<ResourceDownload, ResourceDownloadDto>()
                .ReverseMap();

            CreateMap<ResourceDownload, CreateResourceDownloadDto>()
                .ReverseMap()
                .ForMember(dest => dest.DownloadedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
        }
    }
}