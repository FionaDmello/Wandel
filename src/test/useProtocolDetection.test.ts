import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useProtocolDetection } from "@/hooks/useProtocolDetection";
import type { Profile } from "@/types/database";

vi.mock("@/hooks/useBreakHabits");
vi.mock("@/hooks/useBuildHabits");
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({
            lte: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
      }),
    }),
  },
}));

import { useBreakHabits } from "@/hooks/useBreakHabits";
import { useBuildHabits } from "@/hooks/useBuildHabits";

const TODAY = "2026-05-08";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-1",
    why_statement: null,
    reminder_index: 0,
    reminder_last_rotated: null,
    setup_complete: true,
    last_protocol_check: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(TODAY));
});

afterAll(() => vi.useRealTimers());

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useBreakHabits).mockReturnValue({
    data: [],
    isSuccess: true,
  } as unknown as ReturnType<typeof useBreakHabits>);
  vi.mocked(useBuildHabits).mockReturnValue({
    data: [],
    isSuccess: true,
  } as unknown as ReturnType<typeof useBuildHabits>);
});

describe("useProtocolDetection", () => {
  it("returns empty detected array and not checking when already checked today", () => {
    const profile = makeProfile({ last_protocol_check: TODAY });

    const { result } = renderHook(
      () => useProtocolDetection("user-1", profile),
      { wrapper },
    );

    expect(result.current.detected).toEqual([]);
    expect(result.current.isChecking).toBe(false);
  });

  it("returns isChecking true while detection queries are loading", () => {
    const profile = makeProfile({ last_protocol_check: null });

    const { result } = renderHook(
      () => useProtocolDetection("user-1", profile),
      { wrapper },
    );

    expect(result.current.isChecking).toBe(true);
  });

  it("does not check when userId is empty", () => {
    const profile = makeProfile({ last_protocol_check: null });

    const { result } = renderHook(() => useProtocolDetection("", profile), {
      wrapper,
    });

    expect(result.current.detected).toEqual([]);
    expect(result.current.isChecking).toBe(false);
  });
});
