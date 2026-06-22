"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/fetcher";

// Shapes mirror api/Controllers/WorkspaceController.cs. The
// `assessmentId` round-trips as a string on the frontend (matches the
// existing Assessment.id type) but the API route templates it as a long
// — JSON numbers up to 2^53 deserialise into both fine.
export type DraftPanel = "notes" | "essay" | "scratchpad";

export type WorkspaceDraftsDto = {
  assessmentId: number;
  notes: DraftPanelDto;
  essay: DraftPanelDto;
  scratchpad: DraftPanelDto;
};

export type DraftPanelDto = {
  content: string;
  updatedAt: string | null;
};

// Save status surfaced to the UI ("Saved at 14:23", "Saving…", "Save failed").
// The page reads this directly to render the autosave indicator.
export type AutosaveState =
  | { status: "idle"; lastSavedAt: Date | null }
  | { status: "dirty"; lastSavedAt: Date | null }
  | { status: "saving"; lastSavedAt: Date | null }
  | { status: "saved"; lastSavedAt: Date }
  | { status: "error"; lastSavedAt: Date | null; message: string };

const DEBOUNCE_MS = 1500;

// Reads + writes a single panel for a given assessment, with autosave.
// The caller passes the current value of the textarea; this hook handles
// the rest:
//   - On mount: fetches the saved content.
//   - On value change: debounces 1.5s then POSTs to /api/workspace/drafts.
//   - Exposes `state` so the UI can render "Saving…" / "Saved at 14:23".
//
// Each panel uses its own hook instance — they save independently. The
// underlying GET is shared via TanStack Query, so all panels on one page
// resolve from a single network round-trip.
export function useWorkspaceDraft(assessmentId: string | null, panel: DraftPanel) {
  const enabled = assessmentId !== null && assessmentId !== "";
  const queryClient = useQueryClient();

  const query = useQuery<WorkspaceDraftsDto>({
    queryKey: ["workspace", "drafts", assessmentId],
    queryFn: () =>
      apiClient.get<WorkspaceDraftsDto>(`/api/workspace/drafts/${assessmentId}`),
    enabled,
    staleTime: 30_000,
  });

  const mutation = useMutation<DraftPanelDto, Error, string>({
    mutationFn: (content) =>
      apiClient.put<DraftPanelDto>(`/api/workspace/drafts/${assessmentId}`, {
        panel,
        content,
      }),
    onSuccess: (saved) => {
      // Patch the cached blob so the next read (and any sibling hook for
      // the same assessment) sees the new content + timestamp.
      queryClient.setQueryData<WorkspaceDraftsDto>(
        ["workspace", "drafts", assessmentId],
        (prev) =>
          prev ? { ...prev, [panel]: saved } : prev,
      );
    },
  });

  const serverContent = query.data?.[panel]?.content ?? "";
  const serverUpdatedAt = query.data?.[panel]?.updatedAt
    ? new Date(query.data[panel].updatedAt as string)
    : null;

  const [state, setState] = useState<AutosaveState>({
    status: "idle",
    lastSavedAt: serverUpdatedAt,
  });

  // Once the server response lands, reset our save-state's timestamp.
  useEffect(() => {
    if (serverUpdatedAt) {
      setState((s) =>
        s.status === "idle" || s.status === "saved"
          ? { status: "saved", lastSavedAt: serverUpdatedAt }
          : s,
      );
    }
  }, [serverUpdatedAt?.getTime()]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced commit — caller invokes this on every keystroke; we only
  // actually fire after DEBOUNCE_MS of silence.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef<string>(serverContent);

  const flush = useCallback(async () => {
    timeoutRef.current = null;
    const value = latestValueRef.current;
    if (value === serverContent) {
      // No real change — skip the round-trip.
      setState((s) =>
        s.status === "dirty" || s.status === "saving"
          ? { status: "saved", lastSavedAt: serverUpdatedAt ?? new Date() }
          : s,
      );
      return;
    }
    setState((prev) => ({ status: "saving", lastSavedAt: prev.lastSavedAt }));
    try {
      const saved = await mutation.mutateAsync(value);
      setState({
        status: "saved",
        lastSavedAt: new Date(saved.updatedAt ?? Date.now()),
      });
    } catch (err) {
      setState((prev) => ({
        status: "error",
        lastSavedAt: prev.lastSavedAt,
        message: err instanceof Error ? err.message : "Save failed",
      }));
    }
  }, [mutation, serverContent, serverUpdatedAt]);

  const queueSave = useCallback(
    (value: string) => {
      latestValueRef.current = value;
      if (!enabled) return;
      setState((prev) => ({ status: "dirty", lastSavedAt: prev.lastSavedAt }));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [enabled, flush],
  );

  // Flush any pending edit before the page unmounts (otherwise the user
  // navigates away and loses the last <1.5s of typing).
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Fire-and-forget — the page is unmounting anyway.
        if (latestValueRef.current !== serverContent && enabled) {
          void mutation.mutateAsync(latestValueRef.current).catch(() => {});
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    initialContent: serverContent,
    isLoading: query.isLoading,
    state,
    queueSave,
  };
}
