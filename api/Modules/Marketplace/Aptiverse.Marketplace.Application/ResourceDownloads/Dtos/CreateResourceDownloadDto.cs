namespace Aptiverse.Marketplace.Application.ResourceDownloads.Dtos
{
    public record CreateResourceDownloadDto
    {
        public long ResourceId { get; init; }
        public string UserId { get; init; }
    }
}