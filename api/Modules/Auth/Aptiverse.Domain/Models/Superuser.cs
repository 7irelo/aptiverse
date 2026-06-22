using Aptiverse.Api.Data.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Domain.Models
{
    [Index(nameof(UserId))]
    public class Superuser : IEntityTimestamps
    {
        public long Id { get; set; }
        public required string UserId { get; set; }
        public User? User { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
