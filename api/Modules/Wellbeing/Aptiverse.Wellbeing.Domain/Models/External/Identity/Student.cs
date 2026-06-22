using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Wellbeing.Domain.Models.External.Identity
{
    // External identity projection (source of truth lives in the Auth/Identity
    // module). Not transactional here, so no timestamps are added. UserId is a
    // frequently-filtered lookup column, so it gets an index.
    [Index(nameof(UserId))]
    public class Student
    {
        public long Id { get; set; }
        public string UserId { get; set; }
    }
}
