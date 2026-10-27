import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ResultQuestion } from "@/lib/api/generated/model";

import {
  defaultDuration,
  formatsFor,
  nextPollDelay,
  testStateLabel,
} from "../lib/practice";
import { outcomeOf } from "./results-view";
import { QuestionView } from "./runner/question-view";

const question = {
  id: "q1",
  position: 1,
  kind: "mcq",
  stem: "Solve $x^2 = 9$ for $x > 0$.",
  options: ["$x = 3$", "$x = -3$"],
  marks: 2,
  topic: "Algebra",
  section: null,
  flashcardBack: null,
};

describe("QuestionView", () => {
  it("renders maths with KaTeX and reports the chosen option", async () => {
    const onAnswer = vi.fn();
    const { container } = render(
      <QuestionView
        question={question}
        index={0}
        total={2}
        answer={undefined}
        flagged={false}
        disabled={false}
        onAnswer={onAnswer}
        onToggleFlag={() => {}}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Question 1 of 2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 marks")).toBeInTheDocument();
    expect(container.querySelectorAll(".katex").length).toBeGreaterThan(0);
    await userEvent.click(screen.getAllByRole("radio")[0]!);
    expect(onAnswer).toHaveBeenCalledWith({ selectedIndex: 0 });
  });

  it("uses a text box for written answers", async () => {
    const onAnswer = vi.fn();
    render(
      <QuestionView
        question={{ ...question, kind: "short", options: [] }}
        index={1}
        total={2}
        answer={{ textAnswer: "" }}
        flagged
        disabled={false}
        onAnswer={onAnswer}
        onToggleFlag={() => {}}
      />,
    );
    await userEvent.type(screen.getByLabelText("Your answer"), "3");
    expect(onAnswer).toHaveBeenLastCalledWith({ textAnswer: "3" });
    expect(
      screen.getByRole("button", { name: "Flag for review" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("outcomeOf", () => {
  const base: ResultQuestion = {
    id: "q",
    position: 1,
    kind: "short",
    section: null,
    topic: "Algebra",
    stem: "s",
    options: [],
    marks: 4,
    yourSelectedIndex: null,
    yourAnswer: "x = 3",
    yourSelfRating: null,
    correctIndex: null,
    correctAnswer: "x = 3",
    memo: "",
    explanation: "",
    isCorrect: null,
    awardedMarks: null,
    feedback: null,
    needsReview: false,
    markingStatus: "marked",
  };

  it("says not marked yet instead of inventing a mark", () => {
    expect(outcomeOf({ ...base, markingStatus: "not_marked_yet" }).label).toBe(
      "Not marked yet",
    );
  });

  it("names correct, partly correct, incorrect and not answered", () => {
    expect(outcomeOf({ ...base, isCorrect: true, awardedMarks: 4 }).label).toBe(
      "Correct",
    );
    expect(outcomeOf({ ...base, awardedMarks: 2 }).label).toBe(
      "Partly correct",
    );
    expect(
      outcomeOf({ ...base, isCorrect: false, awardedMarks: 0 }).label,
    ).toBe("Incorrect");
    expect(outcomeOf({ ...base, yourAnswer: null }).label).toBe("Not answered");
  });
});

describe("practice rules", () => {
  it("orders formats by the assessment type and hides reading for university", () => {
    expect(formatsFor("high_school", "essay").slice(0, 2)).toEqual([
      "essay",
      "flashcards",
    ]);
    expect(formatsFor("university")).not.toContain("reading");
  });

  it("polls at 1 s, 2 s, 3 s, then every 5 s", () => {
    expect([0, 1, 2, 3, 9].map(nextPollDelay)).toEqual([
      1000, 2000, 3000, 5000, 5000,
    ]);
  });

  it("rounds timed durations up to 5 minutes within 5 to 180", () => {
    expect(defaultDuration("quiz", 10)).toBe(15);
    expect(defaultDuration("quiz", 1)).toBe(5);
    expect(defaultDuration("reading", 60)).toBe(180);
  });

  it("labels a test that was never taken as not started, never 0%", () => {
    expect(testStateLabel({ status: "ready", latestAttempt: null })).toBe(
      "Not started",
    );
    expect(
      testStateLabel({
        status: "ready",
        latestAttempt: { status: "graded", scorePercent: 75 },
      }),
    ).toBe("Completed, 75%");
  });
});
