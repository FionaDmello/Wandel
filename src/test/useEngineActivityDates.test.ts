import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchEngineActivityDates,
  useEngineActivityDates,
} from "@/hooks/useEngineActivityDates";

const { mockQuery, fromSpy, eqSpy, gteSpy, lteSpy } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  fromSpy: vi.fn(),
  eqSpy: vi.fn(),
  gteSpy: vi.fn(),
  lteSpy: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const chain: Record<string, unknown> = {};
  chain.eq = (...args: unknown[]) => {
    eqSpy(...args);
    return chain;
  };
  chain.gte = (...args: unknown[]) => {
    gteSpy(...args);
    return {
      lte: (...lteArgs: unknown[]) => {
        lteSpy(...lteArgs);
        return mockQuery();
      },
    };
  };
  return {
    supabase: {
      from: (table: string) => {
        fromSpy(table);
        return { select: () => chain };
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

  it("queries all four real Engine panel tables", async () => {
    mockQuery.mockResolvedValue({ data: [], error: null });

    await fetchEngineActivityDates("user-1", {
      from: "2026-04-01",
      to: "2026-04-30",
    });

    expect(fromSpy.mock.calls.map((call) => call[0])).toEqual([
      "hard_things_log",
      "self_love_log",
      "self_worth_evidence",
      "take_up_space_log",
    ]);
  });

  it("filters take_up_space_log to only status='complete' entries", async () => {
    mockQuery.mockResolvedValue({ data: [], error: null });

    await fetchEngineActivityDates("user-1", {
      from: "2026-04-01",
      to: "2026-04-30",
    });

    // Five total .eq() calls: one user_id filter per table (4), plus
    // take_up_space_log's extra status filter, applied last since
    // take_up_space_log is the fourth table queried.
    expect(eqSpy).toHaveBeenCalledTimes(5);
    expect(eqSpy).toHaveBeenNthCalledWith(5, "status", "complete");
  });

  it("scopes every table's query to the given from/to range", async () => {
    mockQuery.mockResolvedValue({ data: [], error: null });

    await fetchEngineActivityDates("user-1", {
      from: "2026-04-01",
      to: "2026-04-30",
    });

    expect(gteSpy).toHaveBeenCalledTimes(4);
    expect(lteSpy).toHaveBeenCalledTimes(4);
    for (const call of gteSpy.mock.calls) {
      expect(call).toEqual(["date", "2026-04-01"]);
    }
    for (const call of lteSpy.mock.calls) {
      expect(call).toEqual(["date", "2026-04-30"]);
    }
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

  it("does not run when options.enabled is false, even with a valid userId", () => {
    const { result } = renderHook(
      () =>
        useEngineActivityDates(
          "user-1",
          { from: "2026-04-01", to: "2026-04-30" },
          { enabled: false },
        ),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
