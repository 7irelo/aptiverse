"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { SUBJECTS } from "@/lib/mockData";

const PAST_PAPERS = [
  { id: "pp1", year: 2024, subject: "Mathematics", paper: "P1", board: "NSC", topic: "Calculus", solved: true },
  { id: "pp2", year: 2024, subject: "Mathematics", paper: "P2", board: "NSC", topic: "Trig + Geometry", solved: false },
  { id: "pp3", year: 2024, subject: "Physical Sciences", paper: "P1", board: "NSC", topic: "Mechanics", solved: true },
  { id: "pp4", year: 2024, subject: "Physical Sciences", paper: "P2", board: "NSC", topic: "Chemistry", solved: false },
  { id: "pp5", year: 2024, subject: "English HL", paper: "P3", board: "IEB", topic: "Creative Writing", solved: false },
  { id: "pp6", year: 2023, subject: "Mathematics", paper: "P1", board: "IEB", topic: "Algebra + Calculus", solved: true },
  { id: "pp7", year: 2023, subject: "Life Sciences", paper: "P1", board: "NSC", topic: "Genetics + Evolution", solved: false },
  { id: "pp8", year: 2023, subject: "Geography", paper: "P1", board: "NSC", topic: "Climatology + Mapwork", solved: false },
];

export default function PastPapersPage() {
  const [year, setYear] = useState("all");
  const [board, setBoard] = useState("all");
  const filtered = PAST_PAPERS.filter(
    (p) => (year === "all" || p.year === Number(year)) && (board === "all" || p.board === board),
  );

  return (
    <>
      <PageHeader
        title="Past papers"
        description="IEB and NSC papers, solved walkthroughs, and AI-recommended questions aligned to your SBA."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Past papers" }]}
      />

      <DataList
        rows={filtered}
        rowKey={(r) => r.id}
        searchPlaceholder="Search papers…"
        filters={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField select size="small" label="Year" value={year} onChange={(e) => setYear(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All years</MenuItem>
              {[2024, 2023, 2022, 2021, 2020].map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Board" value={board} onChange={(e) => setBoard(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All boards</MenuItem>
              <MenuItem value="IEB">IEB</MenuItem>
              <MenuItem value="NSC">NSC</MenuItem>
            </TextField>
          </Stack>
        }
        columns={[
          {
            key: "subject",
            header: "Subject",
            sortable: true,
            render: (r) => (
              <Stack>
                <Typography sx={{ fontWeight: 500 }}>{r.subject}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {r.topic}
                </Typography>
              </Stack>
            ),
          },
          { key: "year", header: "Year", sortable: true, align: "right" },
          { key: "board", header: "Board", render: (r) => <Chip label={r.board} size="small" /> },
          { key: "paper", header: "Paper", sortable: true },
          {
            key: "solved",
            header: "Walkthrough",
            render: (r) => (
              <Chip
                label={r.solved ? "Solved" : "Not yet"}
                size="small"
                color={r.solved ? "success" : "default"}
                variant={r.solved ? "filled" : "outlined"}
              />
            ),
          },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined">
              Open
            </Button>
            <Button size="small" variant="contained">
              Practice
            </Button>
          </Stack>
        )}
      />
    </>
  );
}
