import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useSignupDate } from "@/hooks/useSignupDate";

let profileData: { created_at: string } | undefined;

vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({ data: profileData }),
}));

describe("useSignupDate", () => {
  it("returns the parsed profile creation date once loaded", () => {
    profileData = { created_at: "2026-05-12T10:00:00Z" };
    const { result } = renderHook(() => useSignupDate("user-1"));
    expect(result.current.toISOString().slice(0, 10)).toBe("2026-05-12");
  });

  it("falls back to today while the profile is still loading", () => {
    profileData = undefined;
    const { result } = renderHook(() => useSignupDate("user-1"));
    const today = new Date();
    expect(result.current.toDateString()).toBe(today.toDateString());
  });
});
