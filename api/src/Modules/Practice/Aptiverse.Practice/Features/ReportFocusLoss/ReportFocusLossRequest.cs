namespace Aptiverse.Practice.Features.ReportFocusLoss;

/// <param name="Kind">"visibility_hidden" or "window_blur" (informational).</param>
internal sealed record ReportFocusLossRequest(string Kind);

/// <param name="FocusLossCount">Times the attempt lost focus so far. Shown on results; it never fails an attempt.</param>
internal sealed record FocusLossResult(int FocusLossCount);
