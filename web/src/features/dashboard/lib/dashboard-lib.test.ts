import { describe, expect, it } from "vitest";

import { formatDueLabel, sastInputToIso } from "@/lib/format/date";

import { groupDeadlines } from "./deadlines";
import { activeDays, greetingFor, nscLevel } from "./nsc-level";
import { pickTodaysFocus } from "./pick-todays-focus";

const a = (id: string, dueAt: string) => ({
  assessmentId: id,
  title: `Task ${id}`,
  studyUnitId: "u1",
  unitName: "Mathematics",
  dueAt,
});

describe("pickTodaysFocus", () => {
  // 19 October 23:30 SAST is 21:30 UTC.
  const now = new Date("2026-10-19T21:30:00Z");

  it("overdue beats due today", () => {
    const focus = pickTodaysFocus(
      [a("1", "2026-10-19T21:45:00Z"), a("2", "2026-10-18T08:00:00Z")],
      [],
      now,
    );
    expect(focus?.title).toBe("Overdue: Task 2");
  });

  it("uses SAST midnight: 20 Oct 08:00 SAST is tomorrow at 23:30 SAST", () => {
    const focus = pickTodaysFocus([a("1", "2026-10-20T06:00:00Z")], [], now);
    expect(focus?.title).toBe("Due tomorrow: Task 1");
    expect(formatDueLabel("2026-10-20T06:00:00Z", { now })).toBe(
      "Due tomorrow",
    );
  });

  it("falls back to the weakest topic with evidence, then null", () => {
    const topic = {
      studyUnitId: "u1",
      topic: "Algebra",
      score: 0.4,
      band: "emerging",
      earlyRead: false,
      evidenceQuestions: 8,
    };
    expect(pickTodaysFocus([], [topic], now)?.title).toBe(
      "Recommended: practise Algebra",
    );
    expect(pickTodaysFocus([], [{ ...topic, score: null }], now)).toBeNull();
  });
});

describe("groupDeadlines", () => {
  const now = new Date("2026-10-19T08:00:00Z");
  it("groups into Overdue, Today, This week, Later and caps rows", () => {
    const groups = groupDeadlines(
      [
        a("1", "2026-10-18T08:00:00Z"),
        a("2", "2026-10-19T15:00:00Z"),
        a("3", "2026-10-22T08:00:00Z"),
        a("4", "2026-11-10T08:00:00Z"),
        a("5", "2026-11-11T08:00:00Z"),
        a("6", "2026-11-12T08:00:00Z"),
      ],
      5,
      now,
    );
    expect(groups.map((g) => g.group)).toEqual([
      "Overdue",
      "Today",
      "This week",
      "Later",
    ]);
    expect(groups.flatMap((g) => g.items)).toHaveLength(5);
  });
});

describe("small rules", () => {
  it("greets by SAST hour", () => {
    expect(greetingFor(4)).toBe("Good evening");
    expect(greetingFor(5)).toBe("Good morning");
    expect(greetingFor(12)).toBe("Good afternoon");
    expect(greetingFor(17)).toBe("Good evening");
  });

  it("maps percents to NSC levels", () => {
    expect(nscLevel(80)).toBe(7);
    expect(nscLevel(79.9)).toBe(6);
    expect(nscLevel(29)).toBe(1);
  });

  it("counts only days with real practice", () => {
    expect(
      activeDays([
        { practiceMinutes: 0, attemptsGraded: 0 },
        { practiceMinutes: 12, attemptsGraded: 0 },
        { practiceMinutes: 0, attemptsGraded: 1 },
      ]),
    ).toBe(2);
  });

  it("stores SAST input times as UTC, end of day by default", () => {
    expect(sastInputToIso("2026-10-20")).toBe("2026-10-20T21:59:00.000Z");
    expect(sastInputToIso("2026-10-20", "08:00")).toBe(
      "2026-10-20T06:00:00.000Z",
    );
  });
});
