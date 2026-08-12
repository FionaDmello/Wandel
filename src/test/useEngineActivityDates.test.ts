import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchEngineActivityDates,
  useEngineActivityDates,
} from "@/hooks/useEngineActivityDates";

const { mockQuery } = vi.hoisted(() => ({ mockQuery: vi.fn() }));

vi.mock("@/lib/supabase", () => {
  const lte = () => mockQuery();
  const gte = { lte };
  const eq: Record<string, unknown> = { gte: () => gte };
  eq.eq = () => eq;
  return {
    supabase: {
      from: () => ({
        select: () => eq,
      }),
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

describe("fetchEngineActivityDates", () => {
  it("returns a deduplicated union of dates across all four tables", async () => {
    mockQuery
      .mockReturnValueOnce(
        Promise.resolve({
          data: [{ date: "2026-04-01" }, { date: "2026-04-05" }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        Promise.resolve({
          data: [{ date: "2026-04-05" }, { date: "2026-04-10" }],
          error: null,
        }),
      )
      .mockReturnValueOnce(
        Promise.resolve({ data: [{ date: "2026-04-15" }], error: null }),
      )
      .mockReturnValueOnce(
        Promise.resolve({ data: [{ date: "2026-04-20" }], error: null }),
      );

    const result = await fetchEngineActivityDates("user-1", {
      from: "2026-04-01",
      to: "2026-04-30",
    });

    expect(result).toEqual([
      "2026-04-01",
      "2026-04-05",
      "2026-04-10",
      "2026-04-15",
      "2026-04-20",
    ]);
  });

  it("returns an empty array when all four tables return empty", async () => {
    mockQuery
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }));

    const result = await fetchEngineActivityDates("user-1", {
      from: "2026-04-01",
      to: "2026-04-30",
    });

    expect(result).toEqual([]);
  });

  it("throws when any of the four queries errors", async () => {
    mockQuery
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(
        Promise.resolve({ data: null, error: { message: "DB error" } }),
      );

    await expect(
      fetchEngineActivityDates("user-1", {
        from: "2026-04-01",
        to: "2026-04-30",
      }),
    ).rejects.toEqual({ message: "DB error" });
  });
});

describe("useEngineActivityDates", () => {
  it("exposes the fetched dates via the standard query result shape", async () => {
    mockQuery
      .mockReturnValueOnce(
        Promise.resolve({ data: [{ date: "2026-04-01" }], error: null }),
      )
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }))
      .mockReturnValueOnce(Promise.resolve({ data: [], error: null }));

    const { result } = renderHook(
      () =>
        useEngineActivityDates("user-1", {
          from: "2026-04-01",
          to: "2026-04-30",
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(["2026-04-01"]);
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(
      () =>
        useEngineActivityDates("", { from: "2026-04-01", to: "2026-04-30" }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
