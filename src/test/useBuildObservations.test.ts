import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUpsertBuildObservation } from "@/hooks/useBuildObservations";

const {
  mockObservationInsert,
  mockPreviousObservation,
  mockHabitSingle,
  mockStandingUpExisting,
  mockStandingUpInsert,
  mockStandingUpUpdate,
} = vi.hoisted(() => ({
  mockObservationInsert: vi.fn(),
  mockPreviousObservation: vi.fn(),
  mockHabitSingle: vi.fn(),
  mockStandingUpExisting: vi.fn(),
  mockStandingUpInsert: vi.fn(),
  mockStandingUpUpdate: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const buildObservationsBuilder = {
    insert: () => ({ select: () => ({ single: mockObservationInsert }) }),
    select: () => ({
      eq: () => ({
        eq: () => ({
          lt: () => ({
            order: () => ({
              limit: () => ({ maybeSingle: mockPreviousObservation }),
            }),
          }),
        }),
      }),
    }),
  };
  const habitsBuilder = {
    select: () => ({ eq: () => ({ single: mockHabitSingle }) }),
  };
  const standingUpBuilder = {
    select: () => ({
      eq: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: mockStandingUpExisting }),
        }),
      }),
    }),
    insert: (rows: unknown) => {
      mockStandingUpInsert(rows);
      return Promise.resolve({ error: null });
    },
    update: (fields: unknown) => ({
      eq: (_column: string, id: string) => {
        mockStandingUpUpdate(fields, id);
        return Promise.resolve({ error: null });
      },
    }),
  };

  return {
    supabase: {
      from: (table: string) => {
        if (table === "build_observations") return buildObservationsBuilder;
        if (table === "habits") return habitsBuilder;
        if (table === "standing_up_log") return standingUpBuilder;
        throw new Error(`Unexpected table in test mock: ${table}`);
      },
    },
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

const PAYLOAD = {
  habit_id: "habit-1",
  date: "2026-05-14",
  mark_type: "full" as const,
  mark_label: "Full",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockObservationInsert.mockResolvedValue({
    data: { id: "obs-1", user_id: "user-1", ...PAYLOAD },
    error: null,
  });
  mockStandingUpExisting.mockResolvedValue({ data: null, error: null });
});

describe("useUpsertBuildObservation — standing up on real gaps", () => {
  it("writes a standing_up_log entry when there was a real gap since the last log", async () => {
    mockPreviousObservation.mockResolvedValue({
      data: { date: "2026-05-10" },
      error: null,
    });
    mockHabitSingle.mockResolvedValue({
      data: { name: "Meditation" },
      error: null,
    });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() =>
      expect(mockStandingUpInsert).toHaveBeenCalledWith({
        user_id: "user-1",
        habit_id: "habit-1",
        track_type: "build",
        track_name: "Meditation",
        protocol: "drift",
        fall_date: "2026-05-11",
        return_date: "2026-05-14",
        gap_days: 3,
      }),
    );
    expect(mockStandingUpUpdate).not.toHaveBeenCalled();
  });

  it("sets protocol to slip for a single missed day", async () => {
    mockPreviousObservation.mockResolvedValue({
      data: { date: "2026-05-12" },
      error: null,
    });
    mockHabitSingle.mockResolvedValue({
      data: { name: "Meditation" },
      error: null,
    });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() =>
      expect(mockStandingUpInsert).toHaveBeenCalledWith(
        expect.objectContaining({ protocol: "slip", gap_days: 1 }),
      ),
    );
  });

  it("does not write when logging on a consecutive day with no gap", async () => {
    mockPreviousObservation.mockResolvedValue({
      data: { date: "2026-05-13" },
      error: null,
    });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStandingUpInsert).not.toHaveBeenCalled();
    expect(mockStandingUpUpdate).not.toHaveBeenCalled();
  });

  it("does not write when there is no prior log at all", async () => {
    mockPreviousObservation.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStandingUpInsert).not.toHaveBeenCalled();
    expect(mockStandingUpUpdate).not.toHaveBeenCalled();
  });

  it("does not write a duplicate when this fall episode is already fully resolved", async () => {
    mockPreviousObservation.mockResolvedValue({
      data: { date: "2026-05-10" },
      error: null,
    });
    mockStandingUpExisting.mockResolvedValue({
      data: { id: "existing-entry", return_date: "2026-05-14" },
      error: null,
    });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockStandingUpInsert).not.toHaveBeenCalled();
    expect(mockStandingUpUpdate).not.toHaveBeenCalled();
  });

  it("corrects a stale row in place instead of silently skipping it", async () => {
    mockPreviousObservation.mockResolvedValue({
      data: { date: "2026-05-10" },
      error: null,
    });
    mockHabitSingle.mockResolvedValue({
      data: { name: "Meditation" },
      error: null,
    });
    mockStandingUpExisting.mockResolvedValue({
      data: { id: "stale-entry", return_date: "2026-05-11" },
      error: null,
    });

    const { result } = renderHook(() => useUpsertBuildObservation("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate(PAYLOAD);
    });

    await waitFor(() =>
      expect(mockStandingUpUpdate).toHaveBeenCalledWith(
        {
          track_type: "build",
          track_name: "Meditation",
          protocol: "drift",
          fall_date: "2026-05-11",
          return_date: "2026-05-14",
          gap_days: 3,
        },
        "stale-entry",
      ),
    );
    expect(mockStandingUpInsert).not.toHaveBeenCalled();
  });
});
