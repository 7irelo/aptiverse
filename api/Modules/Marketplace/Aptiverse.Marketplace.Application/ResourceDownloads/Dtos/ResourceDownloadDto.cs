namespace Aptiverse.Marketplace.Application.ResourceDownloads.Dtos
{
    public record ResourceDownloadDto
    {
        public long Id { get; init; }
        public long ResourceId { get; init; }
        public string UserId { get; init; }
        public DateTime DownloadedAt { get; init; }
    }
}