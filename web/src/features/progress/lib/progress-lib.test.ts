import { describe, expect, it } from "vitest";

import { validateGoal } from "../components/create-goal-dialog";
import { baselineRefusal, defaultGoalTitle, goalProgressText } from "./goals";
import { bandLabel, masteryPercent, sortTopics } from "./mastery";

describe("goals", () => {
  it("never shows zero for a goal without evidence", () => {
    expect(
      goalProgressText({
        criteriaType: "mastery_threshold",
        currentValue: null,
        targetValue: 75,
      }),
    ).toBe("No marks yet, target 75%");
    expect(
      goalProgressText({
        criteriaType: "practice_tests_completed",
        currentValue: 2,
        targetValue: 5,
      }),
    ).toBe("2 of 5");
  });

  it("builds default titles and the baseline refusal", () => {
    expect(
      defaultGoalTitle({
        type: "mastery_threshold",
        target: 75,
        topic: "Algebra",
      }),
    ).toBe("Reach 75% in Algebra");
    expect(baselineRefusal(72, "Algebra")).toBe(
      "You're already at 72% in Algebra. Set a target above 72% so this goal measures new work.",
    );
  });

  it("validates the create form", () => {
    const ok = {
      type: "practice_tests_completed",
      unit: "u1",
      target: "5",
      due: "2026-11-01",
      title: "Finish 5 practice tests",
    };
    expect(validateGoal(ok, "subject", "2026-10-27")).toEqual({});
    expect(
      validateGoal({ ...ok, target: "60" }, "subject", "2026-10-27").target,
    ).toBe("Pick a target between 1 and 50.");
    expect(
      validateGoal({ ...ok, due: "2026-10-27" }, "subject", "2026-10-27").due,
    ).toBe("Pick tomorrow or a later date.");
    expect(validateGoal({ ...ok, unit: "" }, "course", "2026-10-27").unit).toBe(
      "Pick a course.",
    );
  });
});

describe("mastery", () => {
  it("names bands in student words and keeps null as not started", () => {
    expect(bandLabel(null)).toBe("Not started");
    expect(bandLabel("emerging")).toBe("Building");
    expect(bandLabel("mastered")).toBe("Strong");
    expect(masteryPercent(null)).toBeNull();
    expect(masteryPercent(0.584)).toBe(58);
  });

  it("sorts weakest first, then fewest answers, then topics without evidence", () => {
    const sorted = sortTopics([
      { topic: "B", score: null, evidenceQuestions: 0 },
      { topic: "C", score: 0.6, evidenceQuestions: 9 },
      { topic: "D", score: 0.6, evidenceQuestions: 3 },
      { topic: "A", score: null, evidenceQuestions: 0 },
      { topic: "E", score: 0.2, evidenceQuestions: 5 },
    ]);
    expect(sorted.map((t) => t.topic)).toEqual(["E", "D", "C", "A", "B"]);
  });
});
