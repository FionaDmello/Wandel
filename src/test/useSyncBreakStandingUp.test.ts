import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
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

import { useSyncBreakStandingUp } from "@/hooks/useSyncBreakStandingUp";
import type { HabitWithConfigs, StandingUpEntry } from "@/types/database";

vi.mock("@/hooks/useBreakHabits");
vi.mock("@/hooks/useBreakSlipEvents");
vi.mock("@/hooks/useStandingUpLog");

const { mockInsert, mockSelect } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockSelect: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      insert: (rows: unknown) => {
        mockInsert(rows);
        return { select: mockSelect };
      },
    }),
  },
}));

import { useBreakHabits } from "@/hooks/useBreakHabits";
import { useBreakSlipEvents } from "@/hooks/useBreakSlipEvents";
import { useAllStandingUpEntries } from "@/hooks/useStandingUpLog";

const TODAY = "2026-05-14";

function makeHabit(
  overrides: Partial<HabitWithConfigs> = {},
): HabitWithConfigs {
  return {
    id: "habit-1",
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
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(TODAY));
});

afterAll(() => vi.useRealTimers());

beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockResolvedValue({ data: [], error: null });
});

describe("useSyncBreakStandingUp", () => {
  it("inserts a resolved standing-up entry for a break habit's slip", async () => {
    vi.mocked(useBreakHabits).mockReturnValue({
      data: [makeHabit()],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakHabits>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [
        {
          habit_id: "habit-1",
          triggered_at: "2026-05-10T00:00:00Z",
        },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);
    vi.mocked(useAllStandingUpEntries).mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof useAllStandingUpEntries>);

    renderHook(() => useSyncBreakStandingUp("user-1"), { wrapper });

    await waitFor(() =>
      expect(mockInsert).toHaveBeenCalledWith([
        {
          user_id: "user-1",
          habit_id: "habit-1",
          track_type: "break",
          track_name: "Smoking",
          protocol: "slip",
          gap_days: 1,
          fall_date: "2026-05-10",
          return_date: "2026-05-11",
        },
      ]),
    );
  });

  it("does not insert when the fall has no confirmed clean day yet", () => {
    vi.mocked(useBreakHabits).mockReturnValue({
      data: [makeHabit()],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakHabits>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [
        {
          habit_id: "habit-1",
          triggered_at: "2026-05-13T00:00:00Z",
        },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);
    vi.mocked(useAllStandingUpEntries).mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof useAllStandingUpEntries>);

    renderHook(() => useSyncBreakStandingUp("user-1"), { wrapper });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("skips fall dates already covered by an existing standing_up_log entry", () => {
    vi.mocked(useBreakHabits).mockReturnValue({
      data: [makeHabit()],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakHabits>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [
        {
          habit_id: "habit-1",
          triggered_at: "2026-05-10T00:00:00Z",
        },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);
    const existing: StandingUpEntry = {
      id: "entry-1",
      user_id: "user-1",
      habit_id: "habit-1",
      track_type: "break",
      track_name: "Smoking",
      fall_date: "2026-05-10",
      return_date: "2026-05-11",
      gap_days: 1,
      protocol: "slip",
      created_at: "2026-05-11T00:00:00Z",
    };
    vi.mocked(useAllStandingUpEntries).mockReturnValue({
      data: [existing],
      isSuccess: true,
    } as unknown as ReturnType<typeof useAllStandingUpEntries>);

    renderHook(() => useSyncBreakStandingUp("user-1"), { wrapper });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("skips habits that are not active", () => {
    vi.mocked(useBreakHabits).mockReturnValue({
      data: [makeHabit({ status: "deactivated" })],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakHabits>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [
        {
          habit_id: "habit-1",
          triggered_at: "2026-05-10T00:00:00Z",
        },
      ],
      isSuccess: true,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);
    vi.mocked(useAllStandingUpEntries).mockReturnValue({
      data: [],
      isSuccess: true,
    } as unknown as ReturnType<typeof useAllStandingUpEntries>);

    renderHook(() => useSyncBreakStandingUp("user-1"), { wrapper });

    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("does nothing while any dependent query has not yet succeeded", () => {
    vi.mocked(useBreakHabits).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as unknown as ReturnType<typeof useBreakHabits>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);
    vi.mocked(useAllStandingUpEntries).mockReturnValue({
      data: undefined,
      isSuccess: false,
    } as unknown as ReturnType<typeof useAllStandingUpEntries>);

    renderHook(() => useSyncBreakStandingUp("user-1"), { wrapper });

    expect(mockInsert).not.toHaveBeenCalled();
  });
});
