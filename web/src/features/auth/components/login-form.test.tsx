import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FormState } from "../lib/form-state";

const loginAction =
  vi.fn<(state: FormState, data: FormData) => Promise<FormState>>();

vi.mock("../server/actions", () => ({
  loginAction: (state: FormState, data: FormData) => loginAction(state, data),
}));

const { LoginForm } = await import("./login-form");

beforeEach(() => loginAction.mockReset());

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), "thandi@example.test");
  await user.type(screen.getByLabelText("Password"), "correct horse");
  await user.click(screen.getByRole("button", { name: "Log in" }));
  return user;
}

describe("LoginForm", () => {
  it("validates on the client before sending anything", async () => {
    const user = userEvent.setup();
    render(<LoginForm next={null} />);
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(
      await screen.findByText(
        "Enter a valid email address, like name@example.com.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(loginAction).not.toHaveBeenCalled();
  });

  it("sends once and shows the API's too-many-attempts message with a reset link", async () => {
    loginAction.mockResolvedValue({
      status: "error",
      at: 1,
      banner: {
        tone: "error",
        message: "Too many attempts. You can try again in 15 minutes.",
        link: { href: "/forgot-password", label: "Reset your password" },
      },
    });
    render(<LoginForm next="/dashboard/practice" />);
    await fillAndSubmit();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "Too many attempts. You can try again in 15 minutes.",
    );
    expect(alert).toHaveFocus();
    expect(
      screen.getByRole("link", { name: "Reset your password" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(loginAction).toHaveBeenCalledTimes(1);

    const data = loginAction.mock.calls[0]![1];
    expect(data.get("email")).toBe("thandi@example.test");
    expect(data.get("next")).toBe("/dashboard/practice");
    expect(data.get("js")).toBe("1");
  });

  it("disables the button while the request is pending", async () => {
    let resolve!: (state: FormState) => void;
    loginAction.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<LoginForm next={null} />);
    await fillAndSubmit();
    const button = await screen.findByRole("button", {
      name: "Logging you in...",
    });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    resolve({ status: "error", at: 2 });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled(),
    );
  });

  it("clears the password after a mismatch", async () => {
    loginAction.mockResolvedValue({
      status: "error",
      at: 3,
      resetFields: ["password"],
      banner: {
        tone: "error",
        message:
          "That email and password do not match. Check them and try again, or reset your password.",
      },
    });
    render(<LoginForm next={null} />);
    await fillAndSubmit();
    await screen.findByRole("alert");
    await waitFor(() =>
      expect(screen.getByLabelText("Password")).toHaveValue(""),
    );
    expect(screen.getByLabelText("Email")).toHaveValue("thandi@example.test");
  });
});
