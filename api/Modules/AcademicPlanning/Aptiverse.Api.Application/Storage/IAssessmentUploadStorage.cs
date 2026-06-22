namespace Aptiverse.AcademicPlanning.Application.Storage
{
    // Storage facade for assessment uploads. Local-disk implementation
    // for v1; swap to S3 later by introducing an S3-backed implementation
    // and registering it in DI — the controller doesn't change.
    //
    // Returned paths are RELATIVE to the configured root so the value
    // stored in Postgres stays portable when the backing store moves.
    public interface IAssessmentUploadStorage
    {
        // Writes the stream and returns the relative storage path.
        // Caller passes a student-scoped folder hint; the storage
        // chooses the final filename (typically a GUID + original
        // extension) to avoid collisions.
        Task<string> WriteAsync(
            string studentId,
            long assessmentId,
            string originalFilename,
            Stream content,
            CancellationToken ct = default);

        // Returns a stream that the caller is responsible for disposing.
        // Returns null when the storage path doesn't resolve (deleted,
        // moved, etc.) — caller treats as 404.
        Task<Stream?> ReadAsync(string storagePath, CancellationToken ct = default);

        // Best-effort delete. Doesn't throw if the file is already gone;
        // the row is the source of truth, the file is just blob.
        Task DeleteAsync(string storagePath, CancellationToken ct = default);
    }
}
