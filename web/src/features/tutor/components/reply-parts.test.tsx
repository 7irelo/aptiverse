import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CitationList, ConfirmCard, ToolActivity } from "./reply-parts";

describe("reply parts", () => {
  it("lists citations with title, headings and page", () => {
    render(
      <CitationList
        citations={[
          {
            chunkId: "c1",
            title: "CAPS Mathematics Grade 11",
            page: 24,
            headingPath: ["Algebra", "Quadratic equations"],
            licence: null,
            displayRule: null,
            private: false,
          },
        ]}
      />,
    );
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(
      screen.getByText(
        "CAPS Mathematics Grade 11, Algebra, Quadratic equations, page 24",
      ),
    ).toBeInTheDocument();
  });

  it("describes tool activity in plain words", () => {
    render(
      <ToolActivity
        tools={[
          { name: "search_curriculum", ok: true },
          { name: "lookup_formula", ok: false },
        ]}
      />,
    );
    expect(
      screen.getByText("Looked through the curriculum"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Lookup formula, did not work/),
    ).toBeInTheDocument();
  });

  it("asks before making a proposed quiz", async () => {
    const onConfirm = vi.fn();
    const onDismiss = vi.fn();
    render(
      <ConfirmCard
        confirm={{
          tool: "propose_quiz",
          arguments: { topic: "Algebra", questionCount: 5 },
        }}
        disabled={false}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    );
    expect(screen.getByText("Topic: Algebra")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Make the quiz" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
