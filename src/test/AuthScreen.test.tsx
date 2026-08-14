import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthScreen } from "@/features/auth/AuthScreen";

const { mockSignInWithPassword, mockSignUp, mockSignInWithOtp } = vi.hoisted(
  () => ({
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockSignInWithOtp: vi.fn(),
  }),
);

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInWithOtp: mockSignInWithOtp,
    },
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ invalidate: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("AuthScreen", () => {
  it("shows the magic link option in sign-in mode", () => {
    render(<AuthScreen />);
    expect(screen.getByText("Send magic link")).toBeInTheDocument();
  });

  it("hides the magic link option after switching to sign-up", () => {
    render(<AuthScreen />);
    fireEvent.click(screen.getByText("No account? Sign up"));
    expect(screen.queryByText("Send magic link")).toBeNull();
  });

  it("restores the magic link option after switching back to sign-in", () => {
    render(<AuthScreen />);
    fireEvent.click(screen.getByText("No account? Sign up"));
    fireEvent.click(screen.getByText("Already have an account? Sign in"));
    expect(screen.getByText("Send magic link")).toBeInTheDocument();
  });
});
