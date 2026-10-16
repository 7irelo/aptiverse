"use client";

import { useMemo } from "react";
import NextLink from "next/link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { Send, User, Coins, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { useMyProposals, type MyProposal, type ProposalStatus } from "@/lib/api/queries";
import { proposalStatusMeta } from "@/lib/tutoring-labels";

// Newest activity first within a group, and the groups themselves ordered so
// the things that need attention (accepted) sit above the settled ones.
const GROUP_ORDER: ProposalStatus[] = ["accepted", "submitted", "declined", "withdrawn"];
const GROUP_HEADING: Record<ProposalStatus, string> = {
  accepted: "Accepted",
  submitted: "Awaiting a decision",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

export default function ProposalsPage() {
  const proposalsQuery = useMyProposals();

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Every proposal you have sent, and where each one stands. When a poster accepts you, the connection moves to your students."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Proposals" }]}
      />
      <QueryStates
        query={proposalsQuery}
        empty={{
          icon: <Send />,
          title: "No proposals yet",
          description:
            "Browse the open listings and spend connects to send your first proposal. They will all show up here so you can track them.",
          action: (
            <Button
              component={NextLink}
              href="/tutor/opportunities"
              variant="contained"
              color="secondary"
            >
              Browse opportunities
            </Button>
          ),
        }}
      >
        {(proposals) => <ProposalsView proposals={proposals} />}
      </QueryStates>
    </>
  );
}

function ProposalsView({ proposals }: { proposals: MyProposal[] }) {
  const groups = useMemo(() => {
    const byStatus = new Map<ProposalStatus, MyProposal[]>();
    for (const p of proposals) {
      const list = byStatus.get(p.status) ?? [];
      list.push(p);
      byStatus.set(p.status, list);
    }
    for (const list of byStatus.values()) {
      list.sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt)));
    }
    return GROUP_ORDER.map((status) => ({ status, items: byStatus.get(status) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [proposals]);

  return (
    <Stack spacing={4}>
      {groups.map((group) => (
        <Box key={group.status}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}
          >
            {GROUP_HEADING[group.status]} ({group.items.length})
          </Typography>
          <Stack spacing={1.5}>
            {group.items.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function ProposalCard({ proposal: p }: { proposal: MyProposal }) {
  const meta = proposalStatusMeta(p.status);
  const accepted = p.status === "accepted";

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={(t) => ({
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        ...(accepted && {
          borderColor: alpha(t.palette.success.main, 0.5),
          background: `linear-gradient(135deg, ${alpha(t.palette.success.main, 0.08)}, transparent 60%)`,
        }),
      })}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>{p.listingTitle}</Typography>
            <Chip label={meta.label} size="small" color={meta.color} variant="outlined" />
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 0.75, color: "text.secondary", rowGap: 0.5 }}
          >
            <Chip label={p.subject} size="small" variant="outlined" />
            <Stack direction="row" spacing={0.5} alignItems="center">
              <User size={14} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {p.learnerName}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Coins size={14} />
              <Typography variant="caption">
                {p.connectsSpent} connect{p.connectsSpent === 1 ? "" : "s"} spent
              </Typography>
            </Stack>
            <Typography variant="caption">
              Sent <RelativeTime iso={p.createdAt} />
            </Typography>
          </Stack>

          <Box
            sx={(t) => ({
              mt: 1.5,
              pl: 1.5,
              borderLeft: `3px solid ${t.palette.divider}`,
              color: "text.secondary",
            })}
          >
            <Typography variant="body2">{p.message}</Typography>
          </Box>

          {accepted && (
            <Button
              component={NextLink}
              href="/tutor/connections"
              variant="contained"
              color="secondary"
              size="small"
              endIcon={<ArrowRight size={16} />}
              sx={{ mt: 2 }}
            >
              Go to my students
            </Button>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
