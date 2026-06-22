"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api/fetcher";

export type AiHelpMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AiHelpResponse = {
  reply: string;
  remaining: number;
  limit: number;
  used: number;
};

export type AiHelpQuotaError = {
  error: "quota_exhausted";
  quotaKey: string;
  Used: number;
  Limit: number;
  message: string;
};

// Wraps POST /api/ai/help. Returns the typed reply on success; on quota
// exhaustion the consumer can inspect `error.body` to surface an upgrade
// CTA with the current snapshot.
export function useAiHelp() {
  return useMutation<AiHelpResponse, ApiError, { messages: AiHelpMessage[] }>({
    mutationFn: (body) => apiClient.post<AiHelpResponse>("/api/ai/help", body),
  });
}

// Best-effort parse of a 402 payload into the structured quota error so
// the UI can render "X / Y used" properly.
export function parseQuotaError(err: ApiError): AiHelpQuotaError | null {
  if (err.status !== 402) return null;
  try {
    const parsed = JSON.parse(err.body) as AiHelpQuotaError;
    if (parsed?.error === "quota_exhausted") return parsed;
    return null;
  } catch {
    return null;
  }
}
