import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmailPasswordForm } from "@/features/auth/EmailPasswordForm";

const { mockSignInWithPassword, mockSignUp } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
}));

const mockInvalidate = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
    },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ invalidate: mockInvalidate }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSignInWithPassword.mockResolvedValue({ error: null });
  mockSignUp.mockResolvedValue({ data: { session: null }, error: null });
  mockInvalidate.mockResolvedValue(undefined);
});

function fillEmailAndPassword() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "user@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password123" },
  });
}

describe("EmailPasswordForm", () => {
  it("shows the sign-in submit label and toggle text when mode is signIn", () => {
    render(
      <EmailPasswordForm
        mode="signIn"
        onToggleMode={vi.fn()}
        onConfirmationRequired={vi.fn()}
      />,
    );
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("No account? Sign up")).toBeInTheDocument();
  });

  it("shows the sign-up submit label and toggle text when mode is signUp", () => {
    render(
      <EmailPasswordForm
        mode="signUp"
        onToggleMode={vi.fn()}
        onConfirmationRequired={vi.fn()}
      />,
    );
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(
      screen.getByText("Already have an account? Sign in"),
    ).toBeInTheDocument();
  });

  it("calls onToggleMode when the toggle button is clicked", () => {
    const onToggleMode = vi.fn();
    render(
      <EmailPasswordForm
        mode="signIn"
        onToggleMode={onToggleMode}
        onConfirmationRequired={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("No account? Sign up"));
    expect(onToggleMode).toHaveBeenCalledOnce();
  });

  it("calls signInWithPassword when submitting in signIn mode", async () => {
    render(
      <EmailPasswordForm
        mode="signIn"
        onToggleMode={vi.fn()}
        onConfirmationRequired={vi.fn()}
      />,
    );
    fillEmailAndPassword();
    fireEvent.click(screen.getByText("Sign in"));
    await waitFor(() =>
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      }),
    );
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("calls signUp when submitting in signUp mode", async () => {
    render(
      <EmailPasswordForm
        mode="signUp"
        onToggleMode={vi.fn()}
        onConfirmationRequired={vi.fn()}
      />,
    );
    fillEmailAndPassword();
    fireEvent.click(screen.getByText("Create account"));
    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      }),
    );
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });
});
