import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakSlipDriftEvents } from "@/hooks/useBreakSlipDriftEvents";

const { mockEq } = vi.hoisted(() => ({ mockEq: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: mockEq,
        }),
      }),
    }),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useBreakSlipDriftEvents", () => {
  it("returns break-track slip and drift events", async () => {
    mockEq.mockResolvedValue({
      data: [
        { habit_id: "h1", triggered_at: "2026-05-10T00:00:00Z", type: "slip" },
        { habit_id: "h1", triggered_at: "2026-05-12T00:00:00Z", type: "drift" },
      ],
      error: null,
    });

    const { result } = renderHook(() => useBreakSlipDriftEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { habit_id: "h1", triggered_at: "2026-05-10T00:00:00Z", type: "slip" },
      { habit_id: "h1", triggered_at: "2026-05-12T00:00:00Z", type: "drift" },
    ]);
  });

  it("filters out rows with a null habit_id", async () => {
    mockEq.mockResolvedValue({
      data: [
        { habit_id: null, triggered_at: "2026-05-10T00:00:00Z", type: "slip" },
        { habit_id: "h1", triggered_at: "2026-05-12T00:00:00Z", type: "slip" },
      ],
      error: null,
    });

    const { result } = renderHook(() => useBreakSlipDriftEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { habit_id: "h1", triggered_at: "2026-05-12T00:00:00Z", type: "slip" },
    ]);
  });

  it("throws when query errors", async () => {
    mockEq.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { result } = renderHook(() => useBreakSlipDriftEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useBreakSlipDriftEvents(""), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockEq).not.toHaveBeenCalled();
  });
});
