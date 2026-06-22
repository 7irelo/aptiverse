using Aptiverse.AcademicPlanning.Application.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Aptiverse.AcademicPlanning.Infrastructure.Storage
{
    // Local-disk implementation. Files live under
    // {RootPath}/{studentId}/{assessmentId}/{guid}.{ext}.
    //
    // Configured via appsettings or env var:
    //   AssessmentUploads__RootPath = /data/aptiverse/uploads   (prod)
    //   AssessmentUploads__RootPath = ./uploads                  (dev default)
    //
    // Pure file-system access — no DB chatter, no cloud dependency.
    // Easy to swap for an S3-backed implementation later; the contract
    // is in IAssessmentUploadStorage and the path returned by WriteAsync
    // is treated as opaque by the caller.
    public class LocalDiskAssessmentUploadStorage : IAssessmentUploadStorage
    {
        private readonly string _root;
        private readonly ILogger<LocalDiskAssessmentUploadStorage> _logger;

        public LocalDiskAssessmentUploadStorage(
            IConfiguration config,
            ILogger<LocalDiskAssessmentUploadStorage> logger)
        {
            _logger = logger;
            var configured = config["AssessmentUploads:RootPath"];
            _root = string.IsNullOrWhiteSpace(configured)
                ? Path.Combine(Directory.GetCurrentDirectory(), "uploads")
                : configured;

            // Ensure the root exists on startup. Fail fast if we can't
            // create it — better to error during boot than at the first
            // upload.
            Directory.CreateDirectory(_root);
            _logger.LogInformation("AssessmentUploads root: {Root}", _root);
        }

        public async Task<string> WriteAsync(
            string studentId,
            long assessmentId,
            string originalFilename,
            Stream content,
            CancellationToken ct = default)
        {
            var safeStudent = Sanitise(studentId);
            var ext = Path.GetExtension(originalFilename);
            if (string.IsNullOrWhiteSpace(ext)) ext = ".bin";
            // Cap extension length defensively — defends against
            // attacker-supplied 200-char "extensions" from malformed names.
            if (ext.Length > 16) ext = ext[..16];

            var name = $"{Guid.NewGuid():N}{ext}";
            var relative = Path.Combine(safeStudent, assessmentId.ToString(), name)
                .Replace('\\', '/');
            var absolute = Path.Combine(_root, relative.Replace('/', Path.DirectorySeparatorChar));

            Directory.CreateDirectory(Path.GetDirectoryName(absolute)!);
            await using (var fs = new FileStream(
                absolute,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true))
            {
                await content.CopyToAsync(fs, ct);
            }

            return relative;
        }

        public Task<Stream?> ReadAsync(string storagePath, CancellationToken ct = default)
        {
            var absolute = Resolve(storagePath);
            if (absolute is null || !File.Exists(absolute))
            {
                return Task.FromResult<Stream?>(null);
            }
            Stream s = new FileStream(
                absolute,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                bufferSize: 81920,
                useAsync: true);
            return Task.FromResult<Stream?>(s);
        }

        public Task DeleteAsync(string storagePath, CancellationToken ct = default)
        {
            var absolute = Resolve(storagePath);
            if (absolute is null) return Task.CompletedTask;
            try
            {
                if (File.Exists(absolute)) File.Delete(absolute);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete upload at {Path}", absolute);
            }
            return Task.CompletedTask;
        }

        // Resolve a relative storage path to an absolute filesystem path,
        // refusing anything that escapes the root (path traversal guard).
        private string? Resolve(string storagePath)
        {
            if (string.IsNullOrWhiteSpace(storagePath)) return null;
            var combined = Path.Combine(_root, storagePath.Replace('/', Path.DirectorySeparatorChar));
            var fullRoot = Path.GetFullPath(_root);
            var fullCombined = Path.GetFullPath(combined);
            if (!fullCombined.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning("Refusing to access storage path outside root: {Path}", storagePath);
                return null;
            }
            return fullCombined;
        }

        // Strip path separators + dotted prefixes from a user-supplied
        // string so it can be used as a folder segment.
        private static string Sanitise(string raw)
        {
            var invalid = Path.GetInvalidFileNameChars();
            var cleaned = new string(raw.Where(c => !invalid.Contains(c) && c != '/' && c != '\\').ToArray());
            cleaned = cleaned.TrimStart('.');
            return string.IsNullOrWhiteSpace(cleaned) ? "_" : cleaned;
        }
    }
}
