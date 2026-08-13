import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBreakHabitObservations } from "@/hooks/useBreakHabitObservations";

const { mockOrder } = vi.hoisted(() => ({ mockOrder: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            not: () => ({
              order: mockOrder,
            }),
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

describe("useBreakHabitObservations", () => {
  it("returns all real urge logs for the habit", async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: "obs-1",
          habit_id: "habit-1",
          logged_at: "2026-05-14T10:00:00Z",
          emotions: [{ id: "e1", observation_id: "obs-1", value: "Tired" }],
        },
      ],
      error: null,
    });

    const { result } = renderHook(
      () => useBreakHabitObservations("user-1", "habit-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("throws when query errors", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { result } = renderHook(
      () => useBreakHabitObservations("user-1", "habit-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when habitId is empty", () => {
    const { result } = renderHook(
      () => useBreakHabitObservations("user-1", ""),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockOrder).not.toHaveBeenCalled();
  });
});
