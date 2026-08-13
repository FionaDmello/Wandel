import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakSlipEvents } from "@/hooks/useBreakSlipEvents";

const { mockEq } = vi.hoisted(() => ({ mockEq: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: mockEq,
          }),
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

describe("useBreakSlipEvents", () => {
  it("returns break-track slip events with full detail", async () => {
    mockEq.mockResolvedValue({
      data: [
        {
          id: "slip-1",
          habit_id: "habit-1",
          triggered_at: "2026-05-10T00:00:00Z",
          job_id: "job-1",
          cause_category: "logistics",
          emotional_state_before: "Tired",
          all_or_nothing_stage: "at_the_slip",
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useBreakSlipEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      {
        id: "slip-1",
        habit_id: "habit-1",
        triggered_at: "2026-05-10T00:00:00Z",
        job_id: "job-1",
        cause_category: "logistics",
        emotional_state_before: "Tired",
        all_or_nothing_stage: "at_the_slip",
      },
    ]);
  });

  it("filters out rows with a null habit_id", async () => {
    mockEq.mockResolvedValue({
      data: [
        {
          id: "slip-1",
          habit_id: null,
          triggered_at: "2026-05-10T00:00:00Z",
          job_id: null,
          cause_category: null,
          emotional_state_before: null,
          all_or_nothing_stage: null,
        },
      ],
      error: null,
    });

    const { result } = renderHook(() => useBreakSlipEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws when query errors", async () => {
    mockEq.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { result } = renderHook(() => useBreakSlipEvents("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useBreakSlipEvents(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockEq).not.toHaveBeenCalled();
  });
});
