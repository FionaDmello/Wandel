import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useWeeklyConsistency } from "@/hooks/useWeeklyConsistency";

const { mockEngineActivity, mockBreakOrder, mockBuildOrder } = vi.hoisted(
  () => ({
    mockEngineActivity: vi.fn(),
    mockBreakOrder: vi.fn(),
    mockBuildOrder: vi.fn(),
  }),
);

vi.mock("@/lib/supabase", () => {
  const makeOrderBuilder = (mockOrder: ReturnType<typeof vi.fn>) => {
    const b: Record<string, unknown> = {};
    b.select = () => b;
    b.eq = () => b;
    b.gte = () => b;
    b.lte = () => b;
    b.order = mockOrder;
    return b;
  };
  const makeEngineActivityBuilder = (mockLte: ReturnType<typeof vi.fn>) => {
    const b: Record<string, unknown> = {};
    b.select = () => b;
    b.eq = () => b;
    b.gte = () => b;
    b.lte = mockLte;
    return b;
  };
  const ENGINE_ACTIVITY_TABLES = new Set([
    "hard_things_log",
    "self_love_log",
    "self_worth_evidence",
    "take_up_space_log",
  ]);
  return {
    supabase: {
      from: (table: string) => {
        if (table === "break_observations")
          return makeOrderBuilder(mockBreakOrder);
        if (table === "build_observations")
          return makeOrderBuilder(mockBuildOrder);
        if (ENGINE_ACTIVITY_TABLES.has(table))
          return makeEngineActivityBuilder(mockEngineActivity);
        throw new Error(`Unexpected table in test mock: ${table}`);
      },
    },
  };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useWeeklyConsistency", () => {
  it("counts distinct dates with engine panel activity for the week", async () => {
    mockEngineActivity.mockResolvedValue({
      data: [{ date: "2026-05-11" }, { date: "2026-05-12" }],
      error: null,
    });
    mockBreakOrder.mockResolvedValue({ data: [], error: null });
    mockBuildOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useWeeklyConsistency("user-1", "2026-05-17"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.engineMarked).toBe(2);
  });

  it("counts distinct days with break observations per habit", async () => {
    mockEngineActivity.mockResolvedValue({ data: [], error: null });
    mockBreakOrder.mockResolvedValue({
      data: [
        { habit_id: "h1", logged_at: "2026-05-12T10:00:00Z" },
        { habit_id: "h1", logged_at: "2026-05-12T14:00:00Z" }, // same day — counts once
        { habit_id: "h1", logged_at: "2026-05-13T09:00:00Z" },
        { habit_id: "h2", logged_at: "2026-05-11T08:00:00Z" },
      ],
      error: null,
    });
    mockBuildOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useWeeklyConsistency("user-1", "2026-05-17"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.breakObsDaysByHabit).toEqual({ h1: 2, h2: 1 });
  });

  it("counts distinct logged dates for build observations per habit", async () => {
    mockEngineActivity.mockResolvedValue({ data: [], error: null });
    mockBreakOrder.mockResolvedValue({ data: [], error: null });
    mockBuildOrder.mockResolvedValue({
      data: [
        { habit_id: "h3", date: "2026-05-12" },
        { habit_id: "h3", date: "2026-05-14" },
        { habit_id: "h4", date: "2026-05-11" },
      ],
      error: null,
    });

    const { result } = renderHook(
      () => useWeeklyConsistency("user-1", "2026-05-17"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.buildObsDaysByHabit).toEqual({ h3: 2, h4: 1 });
  });

  it("throws when any query errors", async () => {
    mockEngineActivity.mockResolvedValue({
      data: null,
      error: { message: "fail" },
    });
    mockBreakOrder.mockResolvedValue({ data: [], error: null });
    mockBuildOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(
      () => useWeeklyConsistency("user-1", "2026-05-17"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(
      () => useWeeklyConsistency("", "2026-05-17"),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockEngineActivity).not.toHaveBeenCalled();
  });
});
