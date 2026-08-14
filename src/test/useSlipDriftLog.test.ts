import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useLogSlipDrift,
  useRecentEngineDriftCount,
} from "@/hooks/useSlipDriftLog";

const { mockSingle, mockGte } = vi.hoisted(() => ({
  mockSingle: vi.fn(),
  mockGte: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      insert: () => ({ select: () => ({ single: mockSingle }) }),
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              gte: mockGte,
            }),
          }),
        }),
      }),
    }),
  },
}));

const PAYLOAD = {
  track_type: "engine" as const,
  type: "slip" as const,
  job_id: null,
  habit_id: null,
  cause_category: null as null,
  emotional_state_before: "Life got heavy\nIt felt too hard",
  protocol_completed: true,
};

const ENTRY = {
  id: "entry-1",
  user_id: "user-1",
  triggered_at: "2026-05-11T00:00:00Z",
  created_at: "2026-05-11T00:00:00Z",
  all_or_nothing_stage: null,
  ...PAYLOAD,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useLogSlipDrift", () => {
  it("inserts with correct payload including user_id", async () => {
    mockSingle.mockResolvedValue({ data: ENTRY, error: null });

    const { result } = renderHook(() => useLogSlipDrift("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ENTRY);
  });

  it("throws when insert errors", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useLogSlipDrift("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("invalidates the track-type-scoped slip-events query on success", async () => {
    mockSingle.mockResolvedValue({ data: ENTRY, error: null });

    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    function localWrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(QueryClientProvider, { client }, children);
    }

    const { result } = renderHook(() => useLogSlipDrift("user-1"), {
      wrapper: localWrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["engine_slip_events", "user-1"],
    });
  });
});

describe("useRecentEngineDriftCount", () => {
  it("returns the count of recent engine drift entries", async () => {
    mockGte.mockResolvedValue({ count: 3, error: null });

    const { result } = renderHook(() => useRecentEngineDriftCount("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(3);
  });

  it("returns 0 when count is null", async () => {
    mockGte.mockResolvedValue({ count: null, error: null });

    const { result } = renderHook(() => useRecentEngineDriftCount("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it("throws when query errors", async () => {
    mockGte.mockResolvedValue({ count: null, error: { message: "DB error" } });

    const { result } = renderHook(() => useRecentEngineDriftCount("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useRecentEngineDriftCount(""), {
      wrapper,
    });
    expect(result.current.fetchStatus).toBe("idle");
    expect(mockGte).not.toHaveBeenCalled();
  });
});
