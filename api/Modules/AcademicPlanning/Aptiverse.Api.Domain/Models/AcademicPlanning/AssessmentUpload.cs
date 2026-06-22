namespace Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning
{
    // A file attached to an assessment — typically a photo of handwritten
    // working, a PDF brief shared by the teacher, or a screenshot of
    // reference material the student is working from.
    //
    // The binary stays on disk (under AssessmentUploads:RootPath in
    // appsettings) rather than in Postgres bytea — keeps the DB lean and
    // lets us swap to S3 later by changing the storage path resolver
    // without touching this entity. The row carries the metadata (where
    // the file lives, its original name, its size and content-type) so
    // the API doesn't need to stat the disk to list a student's uploads.
    public class AssessmentUpload
    {
        public long Id { get; set; }

        // FK to the parent assessment. Indexed via the snake_case
        // naming-convention plugin so list-by-assessment is cheap.
        public long AssessmentId { get; set; }

        // Denormalised from Assessment.StudentId so we can authorise
        // uploads-by-student without an extra join, and so a student
        // who deletes their assessment doesn't strand uploads we can't
        // attribute back to them.
        public required string StudentId { get; set; }

        // The user-visible filename. Sanitised on write so a student
        // submitting "../../etc/passwd" doesn't pollute the response.
        public required string Filename { get; set; }

        // image/jpeg, image/png, image/heic, application/pdf, …
        public required string ContentType { get; set; }

        // Bytes-on-disk after we've written it. Surfaced to the UI so
        // it can show "2.4 MB" next to each upload.
        public long SizeBytes { get; set; }

        // Path relative to the configured RootPath. NOT user-visible —
        // the download endpoint streams the file by id, not by path.
        // Storing as relative keeps it portable: when we move from
        // local disk to S3, the path becomes the S3 key under the same
        // bucket prefix.
        public required string StoragePath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
