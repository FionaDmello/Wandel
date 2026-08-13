import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpdateBreakObservationAftermath } from "@/hooks/useBreakObservations";

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
          eq: (_column: string, id: string) => mockDelete(id),
        }),
        insert: (rows: unknown) => mockInsert(rows),
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

describe("useUpdateBreakObservationAftermath", () => {
  it("updates the aftermath and replaces emotions", async () => {
    mockUpdateSingle.mockResolvedValue({
      data: { id: "obs-1", aftermath: "Felt better" },
      error: null,
    });
    mockDelete.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useUpdateBreakObservationAftermath(), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "obs-1",
        aftermath: "Felt better",
        emotions: ["Calm"],
        userId: "user-1",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockInsert).toHaveBeenCalledWith([
      { observation_id: "obs-1", value: "Calm" },
    ]);
  });

  it("throws when replacing emotions fails to delete the old rows", async () => {
    mockUpdateSingle.mockResolvedValue({
      data: { id: "obs-1", aftermath: "Felt better" },
      error: null,
    });
    mockDelete.mockResolvedValue({ error: { message: "DB error" } });

    const { result } = renderHook(() => useUpdateBreakObservationAftermath(), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "obs-1",
        aftermath: "Felt better",
        emotions: ["Calm"],
        userId: "user-1",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("throws when inserting the new emotions fails", async () => {
    mockUpdateSingle.mockResolvedValue({
      data: { id: "obs-1", aftermath: "Felt better" },
      error: null,
    });
    mockDelete.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: { message: "DB error" } });

    const { result } = renderHook(() => useUpdateBreakObservationAftermath(), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "obs-1",
        aftermath: "Felt better",
        emotions: ["Calm"],
        userId: "user-1",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
