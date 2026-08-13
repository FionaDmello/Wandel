import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakObservationById } from "@/hooks/useBreakObservationById";

const { mockSingle } = vi.hoisted(() => ({ mockSingle: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: mockSingle,
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

describe("useBreakObservationById", () => {
  it("returns the observation", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "obs-1", habit_id: "habit-1", job: "Boredom", emotions: [] },
      error: null,
    });

    const { result } = renderHook(
      () => useBreakObservationById("user-1", "obs-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      id: "obs-1",
      habit_id: "habit-1",
      job: "Boredom",
      emotions: [],
    });
  });

  it("throws when query errors", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(
      () => useBreakObservationById("user-1", "obs-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when id is empty", () => {
    const { result } = renderHook(() => useBreakObservationById("user-1", ""), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockSingle).not.toHaveBeenCalled();
  });
});
