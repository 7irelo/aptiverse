"use client";

import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Loadshedding-aware caption. React Query holds stale data silently
// when a refetch fails or when the user is offline; this surfaces the
// truth in a calm caption underneath a data-driven card.
//
// Below the threshold the component returns null, so fresh fetches
// add no visual noise. Above the threshold the caption appears in
// caption-weight text.secondary, never alarming.
//
// Pair with dataUpdatedAt from a React Query result:
//   <LastSynced at={query.dataUpdatedAt} />

export type LastSyncedProps = {
  at: number | undefined;
  /** Minimum age before the caption appears. Defaults to 5 minutes. */
  thresholdMs?: number;
};

const DEFAULT_THRESHOLD_MS = 5 * 60 * 1000;

export function LastSynced({ at, thresholdMs = DEFAULT_THRESHOLD_MS }: LastSyncedProps) {
  if (!at) return null;
  if (Date.now() - at < thresholdMs) return null;
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: "block", mt: 2 }}
    >
      Last synced {dayjs(at).fromNow()}.
    </Typography>
  );
}
