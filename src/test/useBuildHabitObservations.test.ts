import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useBuildHabitObservations } from "@/hooks/useBuildHabitObservations";

const { mockOrder } = vi.hoisted(() => ({ mockOrder: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            order: mockOrder,
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

describe("useBuildHabitObservations", () => {
  it("returns all observations for the habit", async () => {
    mockOrder.mockResolvedValue({
      data: [
        { id: "obs-1", habit_id: "habit-1", date: "2026-05-14" },
        { id: "obs-2", habit_id: "habit-1", date: "2026-05-10" },
      ],
      error: null,
    });

    const { result } = renderHook(
      () => useBuildHabitObservations("user-1", "habit-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it("throws when query errors", async () => {
    mockOrder.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const { result } = renderHook(
      () => useBuildHabitObservations("user-1", "habit-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when habitId is empty", () => {
    const { result } = renderHook(
      () => useBuildHabitObservations("user-1", ""),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockOrder).not.toHaveBeenCalled();
  });
});
