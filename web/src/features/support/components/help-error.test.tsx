import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import HelpError from "@/app/(marketing)/help/error";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

describe("help page error boundary", () => {
  it("explains the problem and retries", async () => {
    const retry = vi.fn();
    render(<HelpError error={new Error("boom")} retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We could not load the questions",
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
