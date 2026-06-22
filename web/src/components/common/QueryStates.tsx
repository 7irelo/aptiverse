"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/RefreshOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { EmptyState, type EmptyStateProps } from "./EmptyState";

type QueryLike<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch?: () => unknown;
};

type EmptyConfig = Omit<EmptyStateProps, "size"> & { size?: EmptyStateProps["size"] };

export type QueryStatesProps<T> = {
  query: QueryLike<T>;
  /** Treat the data as empty when this returns true (default: array length === 0). */
  isEmpty?: (data: T) => boolean;
  /** Loading skeleton override; default is a generic block skeleton. */
  loading?: React.ReactNode;
  /** Empty-state config (when data loads but matches isEmpty). */
  empty: EmptyConfig;
  /** Render successful data here. */
  children: (data: T) => React.ReactNode;
};

const defaultIsEmpty = <T,>(data: T): boolean =>
  Array.isArray(data) ? data.length === 0 : data == null;

export function QueryStates<T>({
  query,
  isEmpty = defaultIsEmpty,
  loading,
  empty,
  children,
}: QueryStatesProps<T>) {
  if (query.isLoading) {
    return <>{loading ?? <DefaultSkeleton />}</>;
  }
  if (query.isError) {
    const message =
      query.error instanceof Error ? query.error.message : "Something went wrong.";
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ textAlign: "center", py: 6, px: 2 }}>
        <Box sx={{ color: "error.main" }}>
          <ErrorOutlineIcon fontSize="large" />
        </Box>
        <Typography variant="h6">Couldn't load this</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
        {query.refetch && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => query.refetch?.()}
          >
            Try again
          </Button>
        )}
      </Stack>
    );
  }
  if (query.data === undefined || isEmpty(query.data)) {
    return <EmptyState {...empty} />;
  }
  return <>{children(query.data)}</>;
}

function DefaultSkeleton() {
  return (
    <Stack spacing={1.5} sx={{ py: 2 }}>
      <Skeleton variant="rounded" height={64} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={120} />
    </Stack>
  );
}
