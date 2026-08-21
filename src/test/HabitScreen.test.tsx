import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HabitScreen } from "@/features/break/HabitScreen";
import type { HabitWithConfigs } from "@/types/database";

let searchDate: string | undefined;
const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ habitId: "habit-1" }),
  useSearch: () => ({ date: searchDate }),
}));

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({ session: { user: { id: "user-1" } }, loading: false }),
}));

const HABIT: HabitWithConfigs = {
  id: "habit-1",
  user_id: "user-1",
  category: "break",
  name: "Nail biting",
  status: "active",
  paused_at: null,
  sort_order: 0,
  created_at: "2026-05-01T00:00:00Z",
  configs: [],
};

vi.mock("@/hooks/useBreakHabits", () => ({
  useBreakHabit: () => ({ data: HABIT, isLoading: false }),
}));

vi.mock("@/hooks/useHabitStatus", () => ({
  useUpdateHabitStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useResetBreakHabit: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/useBreakHabitObservations", () => ({
  useBreakHabitObservations: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useBreakSlipEvents", () => ({
  useBreakSlipEvents: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useStandingUpLog", () => ({
  useStandingUpEntries: () => ({ data: [], isLoading: false }),
}));

describe("HabitScreen — date threading (#28 follow-up)", () => {
  it("carries the search date through to the log screen", () => {
    searchDate = "2026-05-14";
    render(<HabitScreen />);
    fireEvent.click(screen.getByText("Log an urge"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/break/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14" },
    });
  });

  it("passes an undefined date through when visited without one", () => {
    searchDate = undefined;
    render(<HabitScreen />);
    fireEvent.click(screen.getByText("Log an urge"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/break/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: undefined },
    });
  });
});
