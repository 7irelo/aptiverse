import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { API_URL } from "../../../../tests/msw/handlers";
import { server } from "../../../../tests/msw/server";
import { onServer } from "../../../../tests/server-env";

import { HelpFaqs } from "./help-faqs";

// Next.js runtime APIs are no-ops outside a Next server.
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("next/server", () => ({ connection: vi.fn(async () => {}) }));

describe("help page FAQs", () => {
  it("renders FAQs from the API grouped by category", async () => {
    render(await onServer(() => HelpFaqs()));

    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "Getting started",
      "Practice",
      "Account and support",
    ]);

    const gettingStarted = screen.getByRole("region", {
      name: "Getting started",
    });
    const questions = within(gettingStarted).getAllByRole("button");
    expect(questions.map((q) => q.textContent)).toEqual([
      "Who is Aptiverse for?",
      "Can I change my subjects later?",
    ]);
  });

  it("opens an answer when the question is pressed", async () => {
    const user = userEvent.setup();
    render(await onServer(() => HelpFaqs()));

    const question = screen.getByRole("button", {
      name: "How do I contact support?",
    });
    expect(question).toHaveAttribute("aria-expanded", "false");

    await user.click(question);

    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(/a person will get back to you/)).toBeVisible();
  });

  it("shows a friendly empty state when there are no FAQs", async () => {
    server.use(
      http.get(`${API_URL}/support/faqs`, () => HttpResponse.json([])),
    );

    render(await onServer(() => HelpFaqs()));

    expect(
      screen.getByRole("heading", { name: "No questions here yet" }),
    ).toBeInTheDocument();
  });

  it("throws for the error boundary when the API fails", async () => {
    server.use(
      http.get(`${API_URL}/support/faqs`, () =>
        HttpResponse.json(
          { title: "Server error", status: 500 },
          { status: 500 },
        ),
      ),
    );

    await expect(onServer(() => HelpFaqs())).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
  });

  it("rejects responses that do not match the API contract", async () => {
    server.use(
      http.get(`${API_URL}/support/faqs`, () =>
        HttpResponse.json([{ id: "not-a-uuid" }]),
      ),
    );

    await expect(onServer(() => HelpFaqs())).rejects.toThrow();
  });
});
