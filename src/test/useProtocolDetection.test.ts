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
import type { HabitWithConfigs, Profile } from "@/types/database";

vi.mock("@/hooks/useBreakHabits");
vi.mock("@/hooks/useBuildHabits");

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table);
      const builder: Record<string, unknown> = {};
      builder.select = () => builder;
      builder.eq = () => builder;
      builder.gte = () => Promise.resolve({ data: [], error: null });
      return builder;
    },
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

function makeBreakHabit(
  overrides: Partial<HabitWithConfigs> = {},
): HabitWithConfigs {
  return {
    id: "break-1",
    user_id: "user-1",
    category: "break",
    name: "Smoking",
    status: "active",
    paused_at: null,
    sort_order: 0,
    created_at: "",
    configs: [],
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

  it("queries slip_drift_log (not break_observations) for the break drift signal", () => {
    const profile = makeProfile({ last_protocol_check: null });
    vi.mocked(useBreakHabits).mockReturnValue({
      data: [makeBreakHabit()],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakHabits>);

    renderHook(() => useProtocolDetection("user-1", profile), { wrapper });

    expect(mockFrom).toHaveBeenCalledWith("slip_drift_log");
    expect(mockFrom).not.toHaveBeenCalledWith("break_observations");
  });
});
