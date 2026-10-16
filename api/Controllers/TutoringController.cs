using System.Security.Claims;
using System.Text.Json.Serialization;
using Aptiverse.Api.Data;
using Aptiverse.Booking.Domain.Models.Booking;
using Aptiverse.Domain.Models;
using Aptiverse.Marketplace.Domain.Models.Marketplace;
using Aptiverse.Notifications.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Booking.Controllers
{
    // The tutoring marketplace, run like a jobs board. A student (or a parent
    // for their child) posts a listing describing the help they need; tutors
    // spend connects to submit a proposal; the poster reads the proposals and
    // accepts one, which forms the working connection. Aptiverse never touches
    // money between them; the tutoring itself is arranged off-platform.
    [ApiController]
    [Route("api/tutoring")]
    [Authorize]
    public class TutoringController(ApplicationDbContext db, INotificationService notifications) : ControllerBase
    {
        private readonly ApplicationDbContext _db = db;
        private readonly INotificationService _notifications = notifications;

        // Connects a proposal costs, and the monthly grant a tutor's balance is
        // topped up to. Kept here so the economy is one place, not scattered.
        private const int ProposalCost = 2;
        private const int MonthlyConnectGrant = 20;

        private string? CurrentUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("userId")?.Value;

        private async Task<string> DisplayNameAsync(string userId, CancellationToken ct)
        {
            var u = await _db.Set<User>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId, ct);
            var name = u is null ? "" : $"{u.FirstName} {u.LastName}".Trim();
            return string.IsNullOrWhiteSpace(name) ? "A member" : name;
        }

        // ---- Listings (poster side) ---------------------------------------

        // A student posts for themselves, or a parent posts for a linked child
        // (learnerId set to the child, validated against an accepted ParentLink).
        [HttpPost("listings")]
        public async Task<ActionResult<ListingDto>> CreateListing([FromBody] CreateListingDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var title = (body.Title ?? "").Trim();
            if (title.Length < 3) return BadRequest("Give the listing a title.");
            var subject = (body.Subject ?? "").Trim();
            if (subject.Length == 0) return BadRequest("Say what subject the help is for.");

            var learnerId = uid;
            var postedByRole = "student";
            if (!string.IsNullOrWhiteSpace(body.LearnerId) && body.LearnerId != uid)
            {
                // Posting for someone else is only allowed for a parent with an
                // accepted link to that student.
                var linked = await _db.Set<ParentLink>().AsNoTracking().AnyAsync(
                    l => l.ParentUserId == uid && l.StudentUserId == body.LearnerId && l.Status == "accepted", ct);
                if (!linked) return Forbid();
                learnerId = body.LearnerId;
                postedByRole = "parent";
            }

            var listing = new TutorListing
            {
                LearnerId = learnerId,
                LearnerName = await DisplayNameAsync(learnerId, ct),
                PostedByUserId = uid,
                PostedByRole = postedByRole,
                Title = title,
                Subject = subject,
                Level = (body.Level ?? "").Trim(),
                Details = (body.Details ?? "").Trim(),
                Mode = NormaliseMode(body.Mode),
            };
            _db.Add(listing);
            await _db.SaveChangesAsync(ct);

            return Ok(ToListingDto(listing, proposals: 0, isMine: true, alreadyProposed: false));
        }

        // Listings the caller posted, or that were posted for them as a learner.
        [HttpGet("listings/mine")]
        public async Task<ActionResult<IEnumerable<ListingDto>>> MyListings(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var listings = await _db.Set<TutorListing>().AsNoTracking()
                .Where(l => l.PostedByUserId == uid || l.LearnerId == uid)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync(ct);

            var ids = listings.Select(l => l.Id).ToList();
            var counts = (await _db.Set<TutorProposal>().AsNoTracking()
                .Where(p => ids.Contains(p.ListingId) && p.Status == "submitted")
                .GroupBy(p => p.ListingId)
                .Select(g => new { g.Key, Count = g.Count() })
                .ToListAsync(ct))
                .ToDictionary(x => x.Key, x => x.Count);

            return Ok(listings.Select(l => ToListingDto(
                l, counts.TryGetValue(l.Id, out var c) ? c : 0, isMine: true, alreadyProposed: false)));
        }

        // The proposals on one of the caller's listings, richest first.
        [HttpGet("listings/{id:long}/proposals")]
        public async Task<ActionResult<IEnumerable<ProposalDto>>> ListingProposals(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var listing = await _db.Set<TutorListing>().AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, ct);
            if (listing is null) return NotFound();
            if (listing.PostedByUserId != uid && listing.LearnerId != uid) return Forbid();

            var rows = await (from p in _db.Set<TutorProposal>().AsNoTracking()
                              where p.ListingId == id
                              join t in _db.Set<Tutor>().AsNoTracking() on p.TutorUserId equals t.UserId into tj
                              from t in tj.DefaultIfEmpty()
                              select new { p, t })
                              .ToListAsync(ct);

            var dtos = rows
                .OrderByDescending(x => x.p.Status == "accepted")
                .ThenByDescending(x => x.t != null && x.t.IsVerified)
                .ThenByDescending(x => x.t != null ? x.t.Rating : 0)
                .Select(x => new ProposalDto
                {
                    Id = x.p.Id.ToString(),
                    ListingId = x.p.ListingId.ToString(),
                    TutorId = x.p.TutorUserId,
                    TutorName = x.p.TutorName,
                    Message = x.p.Message,
                    Status = x.p.Status,
                    CreatedAt = x.p.CreatedAt,
                    TutorRating = x.t?.Rating ?? 0,
                    TutorReviews = x.t?.TotalReviews ?? 0,
                    TutorVerified = x.t?.IsVerified ?? false,
                    TutorQualification = x.t?.Qualification ?? "",
                });
            return Ok(dtos);
        }

        // The poster accepts a proposal: it wins, the listing fills, the rest are
        // declined, and a connection is formed between tutor and learner.
        [HttpPost("proposals/{id:long}/accept")]
        public async Task<IActionResult> AcceptProposal(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var proposal = await _db.Set<TutorProposal>().FirstOrDefaultAsync(p => p.Id == id, ct);
            if (proposal is null) return NotFound();
            var listing = await _db.Set<TutorListing>().FirstOrDefaultAsync(l => l.Id == proposal.ListingId, ct);
            if (listing is null) return NotFound();
            if (listing.PostedByUserId != uid && listing.LearnerId != uid) return Forbid();
            if (listing.Status != "open") return BadRequest("This listing is no longer open.");

            proposal.Status = "accepted";
            listing.Status = "filled";
            var others = await _db.Set<TutorProposal>()
                .Where(p => p.ListingId == listing.Id && p.Id != proposal.Id && p.Status == "submitted")
                .ToListAsync(ct);
            foreach (var o in others) o.Status = "declined";

            // Form (or revive) the working connection between tutor and learner.
            var connection = await _db.Set<TutorConnection>()
                .FirstOrDefaultAsync(c => c.TutorUserId == proposal.TutorUserId && c.StudentId == listing.LearnerId, ct);
            if (connection is null)
            {
                _db.Add(new TutorConnection
                {
                    TutorUserId = proposal.TutorUserId,
                    StudentId = listing.LearnerId,
                    StudentName = listing.LearnerName,
                    Subject = listing.Subject,
                    Status = "active",
                    InitiatedBy = "proposal",
                    ConnectedAt = DateTime.UtcNow,
                });
            }
            else
            {
                connection.Status = "active";
                connection.UpdatedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync(ct);

            await _notifications.EnqueueAsync(
                proposal.TutorUserId, "celebration",
                "Your proposal was accepted",
                $"{listing.LearnerName} picked you for \"{listing.Title}\". Reach out to arrange your first session.",
                "/tutor/connections", ct);
            foreach (var o in others)
            {
                await _notifications.EnqueueAsync(
                    o.TutorUserId, "info",
                    "A listing was filled",
                    $"\"{listing.Title}\" went with another tutor this time.",
                    "/tutor/opportunities", ct);
            }

            return NoContent();
        }

        [HttpPost("listings/{id:long}/close")]
        public async Task<IActionResult> CloseListing(long id, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var listing = await _db.Set<TutorListing>().FirstOrDefaultAsync(l => l.Id == id, ct);
            if (listing is null) return NoContent();
            if (listing.PostedByUserId != uid && listing.LearnerId != uid) return Forbid();

            listing.Status = "closed";
            listing.UpdatedAt = DateTime.UtcNow;
            var open = await _db.Set<TutorProposal>()
                .Where(p => p.ListingId == id && p.Status == "submitted").ToListAsync(ct);
            foreach (var p in open) p.Status = "declined";
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ---- Opportunities (tutor side) -----------------------------------

        // Open listings a tutor can bid on, newest first, each flagged with
        // whether the tutor has already proposed.
        [HttpGet("listings/open")]
        public async Task<ActionResult<IEnumerable<ListingDto>>> OpenListings([FromQuery] string? q, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var query = _db.Set<TutorListing>().AsNoTracking().Where(l => l.Status == "open" && l.LearnerId != uid);
            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.Trim();
                query = query.Where(l => EF.Functions.ILike(l.Title, $"%{term}%") || EF.Functions.ILike(l.Subject, $"%{term}%"));
            }
            var listings = await query.OrderByDescending(l => l.CreatedAt).Take(100).ToListAsync(ct);

            var ids = listings.Select(l => l.Id).ToList();
            var counts = (await _db.Set<TutorProposal>().AsNoTracking()
                .Where(p => ids.Contains(p.ListingId) && p.Status == "submitted")
                .GroupBy(p => p.ListingId).Select(g => new { g.Key, Count = g.Count() })
                .ToListAsync(ct)).ToDictionary(x => x.Key, x => x.Count);
            var mineProposed = (await _db.Set<TutorProposal>().AsNoTracking()
                .Where(p => ids.Contains(p.ListingId) && p.TutorUserId == uid)
                .Select(p => p.ListingId).ToListAsync(ct)).ToHashSet();

            return Ok(listings.Select(l => ToListingDto(
                l, counts.TryGetValue(l.Id, out var c) ? c : 0, isMine: false, alreadyProposed: mineProposed.Contains(l.Id))));
        }

        // Submit a proposal, spending connects. The tutor must have enough, the
        // listing must be open, and one proposal per listing.
        [HttpPost("listings/{id:long}/propose")]
        public async Task<ActionResult<ProposalDto>> Propose(long id, [FromBody] ProposeDto body, CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var listing = await _db.Set<TutorListing>().AsNoTracking().FirstOrDefaultAsync(l => l.Id == id, ct);
            if (listing is null) return NotFound();
            if (listing.Status != "open") return BadRequest("This listing is no longer open.");
            if (listing.LearnerId == uid) return BadRequest("You can't propose on your own listing.");

            var message = (body.Message ?? "").Trim();
            if (message.Length < 10) return BadRequest("Write a short pitch so the student knows how you can help.");

            var already = await _db.Set<TutorProposal>().AnyAsync(p => p.ListingId == id && p.TutorUserId == uid, ct);
            if (already) return Conflict("You have already proposed on this listing.");

            var tutor = await _db.Set<Tutor>().FirstOrDefaultAsync(t => t.UserId == uid, ct);
            if (tutor is null) return BadRequest("Set up your tutor profile before proposing.");
            RefreshConnects(tutor);
            if (tutor.Connects < ProposalCost)
                return Conflict($"You need {ProposalCost} connects to propose and have {tutor.Connects}.");

            tutor.Connects -= ProposalCost;
            var tutorName = await DisplayNameAsync(uid, ct);
            var proposal = new TutorProposal
            {
                ListingId = id,
                TutorUserId = uid,
                TutorName = tutorName,
                Message = message,
                ConnectsSpent = ProposalCost,
            };
            _db.Add(proposal);
            await _db.SaveChangesAsync(ct);

            await _notifications.EnqueueAsync(
                listing.PostedByUserId, "info",
                "New proposal on your listing",
                $"{tutorName} proposed on \"{listing.Title}\". Read it and pick your tutor.",
                "/dashboard/tutors/listings", ct);

            return Ok(new ProposalDto
            {
                Id = proposal.Id.ToString(),
                ListingId = id.ToString(),
                TutorId = uid,
                TutorName = tutorName,
                Message = message,
                Status = "submitted",
                CreatedAt = proposal.CreatedAt,
                TutorRating = tutor.Rating,
                TutorReviews = tutor.TotalReviews,
                TutorVerified = tutor.IsVerified,
                TutorQualification = tutor.Qualification ?? "",
            });
        }

        // The tutor's own proposals, with the listing they were made against.
        [HttpGet("proposals/mine")]
        public async Task<ActionResult<IEnumerable<MyProposalDto>>> MyProposals(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var rows = await (from p in _db.Set<TutorProposal>().AsNoTracking()
                              where p.TutorUserId == uid
                              join l in _db.Set<TutorListing>().AsNoTracking() on p.ListingId equals l.Id
                              orderby p.CreatedAt descending
                              select new { p, l }).ToListAsync(ct);

            return Ok(rows.Select(x => new MyProposalDto
            {
                Id = x.p.Id.ToString(),
                ListingId = x.p.ListingId.ToString(),
                ListingTitle = x.l.Title,
                Subject = x.l.Subject,
                LearnerName = x.l.LearnerName,
                Message = x.p.Message,
                Status = x.p.Status,
                ConnectsSpent = x.p.ConnectsSpent,
                CreatedAt = x.p.CreatedAt,
            }));
        }

        // The tutor's connect balance (topping it up for the month on read).
        [HttpGet("connects")]
        public async Task<ActionResult<ConnectsDto>> GetConnects(CancellationToken ct)
        {
            var uid = CurrentUserId();
            if (string.IsNullOrEmpty(uid)) return Unauthorized();

            var tutor = await _db.Set<Tutor>().FirstOrDefaultAsync(t => t.UserId == uid, ct);
            if (tutor is null) return Ok(new ConnectsDto { Balance = 0, ProposalCost = ProposalCost, MonthlyGrant = MonthlyConnectGrant });

            if (RefreshConnects(tutor)) await _db.SaveChangesAsync(ct);
            return Ok(new ConnectsDto { Balance = tutor.Connects, ProposalCost = ProposalCost, MonthlyGrant = MonthlyConnectGrant });
        }

        // Top a tutor up to the monthly grant once per calendar month. Returns
        // true when it changed something so the caller can persist. A balance
        // already above the grant (a paid top-up) is left alone.
        private static bool RefreshConnects(Tutor tutor)
        {
            var now = DateTime.UtcNow;
            var last = tutor.ConnectsRefreshedAt;
            var dueThisMonth = last is null || last.Value.Year != now.Year || last.Value.Month != now.Month;
            if (!dueThisMonth) return false;
            tutor.ConnectsRefreshedAt = now;
            if (tutor.Connects < MonthlyConnectGrant)
            {
                tutor.Connects = MonthlyConnectGrant;
                return true;
            }
            return true;
        }

        private static string NormaliseMode(string? mode) =>
            mode is "online" or "in_person" ? mode : "either";

        private static ListingDto ToListingDto(TutorListing l, int proposals, bool isMine, bool alreadyProposed) => new()
        {
            Id = l.Id.ToString(),
            LearnerId = l.LearnerId,
            LearnerName = l.LearnerName,
            PostedByRole = l.PostedByRole,
            Title = l.Title,
            Subject = l.Subject,
            Level = l.Level,
            Details = l.Details,
            Mode = l.Mode,
            Status = l.Status,
            Proposals = proposals,
            IsMine = isMine,
            AlreadyProposed = alreadyProposed,
            CreatedAt = l.CreatedAt,
        };
    }

    public record CreateListingDto
    {
        [JsonPropertyName("learnerId")] public string? LearnerId { get; init; }
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("level")] public string? Level { get; init; }
        [JsonPropertyName("details")] public string? Details { get; init; }
        [JsonPropertyName("mode")] public string? Mode { get; init; }
    }

    public record ListingDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("learnerId")] public string LearnerId { get; init; } = "";
        [JsonPropertyName("learnerName")] public string LearnerName { get; init; } = "";
        [JsonPropertyName("postedByRole")] public string PostedByRole { get; init; } = "student";
        [JsonPropertyName("title")] public string Title { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("level")] public string Level { get; init; } = "";
        [JsonPropertyName("details")] public string Details { get; init; } = "";
        [JsonPropertyName("mode")] public string Mode { get; init; } = "either";
        [JsonPropertyName("status")] public string Status { get; init; } = "open";
        [JsonPropertyName("proposals")] public int Proposals { get; init; }
        [JsonPropertyName("isMine")] public bool IsMine { get; init; }
        [JsonPropertyName("alreadyProposed")] public bool AlreadyProposed { get; init; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record ProposeDto
    {
        [JsonPropertyName("message")] public string Message { get; init; } = "";
    }

    public record ProposalDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("listingId")] public string ListingId { get; init; } = "";
        [JsonPropertyName("tutorId")] public string TutorId { get; init; } = "";
        [JsonPropertyName("tutorName")] public string TutorName { get; init; } = "";
        [JsonPropertyName("message")] public string Message { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "submitted";
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
        [JsonPropertyName("tutorRating")] public double TutorRating { get; init; }
        [JsonPropertyName("tutorReviews")] public int TutorReviews { get; init; }
        [JsonPropertyName("tutorVerified")] public bool TutorVerified { get; init; }
        [JsonPropertyName("tutorQualification")] public string TutorQualification { get; init; } = "";
    }

    public record MyProposalDto
    {
        [JsonPropertyName("id")] public string Id { get; init; } = "";
        [JsonPropertyName("listingId")] public string ListingId { get; init; } = "";
        [JsonPropertyName("listingTitle")] public string ListingTitle { get; init; } = "";
        [JsonPropertyName("subject")] public string Subject { get; init; } = "";
        [JsonPropertyName("learnerName")] public string LearnerName { get; init; } = "";
        [JsonPropertyName("message")] public string Message { get; init; } = "";
        [JsonPropertyName("status")] public string Status { get; init; } = "submitted";
        [JsonPropertyName("connectsSpent")] public int ConnectsSpent { get; init; }
        [JsonPropertyName("createdAt")] public DateTime CreatedAt { get; init; }
    }

    public record ConnectsDto
    {
        [JsonPropertyName("balance")] public int Balance { get; init; }
        [JsonPropertyName("proposalCost")] public int ProposalCost { get; init; }
        [JsonPropertyName("monthlyGrant")] public int MonthlyGrant { get; init; }
    }
}
