import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BuildHabitScreen } from "@/features/build/BuildHabitScreen";
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
  category: "build",
  name: "Morning run",
  status: "active",
  paused_at: null,
  sort_order: 0,
  created_at: "2026-05-01T00:00:00Z",
  configs: [],
};

vi.mock("@/hooks/useBuildHabits", () => ({
  useBuildHabit: () => ({ data: HABIT, isLoading: false }),
}));

vi.mock("@/hooks/useHabitStatus", () => ({
  useUpdateHabitStatus: () => ({ mutate: vi.fn(), isPending: false }),
  useResetBuildHabit: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/useBuildHabitObservations", () => ({
  useBuildHabitObservations: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useBuildSlipEvents", () => ({
  useBuildSlipEvents: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/useStandingUpLog", () => ({
  useStandingUpEntries: () => ({ data: [], isLoading: false }),
}));

describe("BuildHabitScreen — date threading (#28 follow-up)", () => {
  it("carries the search date through to the log screen", () => {
    searchDate = "2026-05-14";
    render(<BuildHabitScreen />);
    fireEvent.click(screen.getByText("Log today's effort"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/build/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14" },
    });
  });

  it("passes an undefined date through when visited without one", () => {
    searchDate = undefined;
    render(<BuildHabitScreen />);
    fireEvent.click(screen.getByText("Log today's effort"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/build/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: undefined },
    });
  });

  it("hides 'I slipped' when viewing a specific past date, since it can't be backdated", () => {
    searchDate = "2026-05-14";
    render(<BuildHabitScreen />);
    expect(screen.queryByText("I slipped")).not.toBeInTheDocument();
  });

  it("shows 'I slipped' when visited without a date", () => {
    searchDate = undefined;
    render(<BuildHabitScreen />);
    expect(screen.getByText("I slipped")).toBeInTheDocument();
  });
});
