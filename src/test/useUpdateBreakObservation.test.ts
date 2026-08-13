import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateBreakObservation } from "@/hooks/useUpdateBreakObservation";

const { mockUpdateSingle, mockDelete, mockInsert } = vi.hoisted(() => ({
  mockUpdateSingle: vi.fn(),
  mockDelete: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "break_observations") {
        return {
          update: () => ({
            eq: () => ({ select: () => ({ single: mockUpdateSingle }) }),
          }),
        };
      }
      return {
        delete: () => ({
          eq: (_column: string, id: string) => {
            mockDelete(id);
            return Promise.resolve({ error: null });
          },
        }),
        insert: (rows: unknown) => {
          mockInsert(rows);
          return Promise.resolve({ error: null });
        },
      };
    },
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useUpdateBreakObservation", () => {
  it("updates the row and replaces its emotions", async () => {
    mockUpdateSingle.mockResolvedValue({
      data: { id: "obs-1", habit_id: "habit-1", job: "Boredom" },
      error: null,
    });

    const { result } = renderHook(() => useUpdateBreakObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "obs-1",
        job: "Boredom",
        context: "At my desk",
        urge_intensity: 6,
        emotions: ["Tired", "Restless"],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDelete).toHaveBeenCalledWith("obs-1");
    expect(mockInsert).toHaveBeenCalledWith([
      { observation_id: "obs-1", value: "Tired" },
      { observation_id: "obs-1", value: "Restless" },
    ]);
  });

  it("does not insert emotions when none are given", async () => {
    mockUpdateSingle.mockResolvedValue({
      data: { id: "obs-1", habit_id: "habit-1", job: "Boredom" },
      error: null,
    });

    const { result } = renderHook(() => useUpdateBreakObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "obs-1",
        job: "Boredom",
        urge_intensity: 6,
        emotions: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
