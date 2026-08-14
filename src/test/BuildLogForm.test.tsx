import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuildLogForm } from "@/features/build/BuildLogForm";
import type { HabitConfig } from "@/types/database";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockUpsert = vi.fn(
  (_payload: unknown, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
);

vi.mock("@/hooks/useBuildObservations", () => ({
  useHabitDayObservations: () => ({ data: [], isLoading: false }),
  useUpsertBuildObservation: () => ({ mutate: mockUpsert, isPending: false }),
}));

function makeConfig(overrides: Partial<HabitConfig> = {}): HabitConfig {
  return {
    id: "config-1",
    habit_id: "habit-1",
    key: "anchor",
    value: "waking up",
    sub_type: "Reading",
    sort_order: 0,
    created_at: "",
    ...overrides,
  };
}

const CONFIGS: HabitConfig[] = [
  makeConfig({
    id: "c1",
    key: "anchor",
    value: "waking up",
    sub_type: "Reading",
  }),
  makeConfig({ id: "c2", key: "anchor", value: "lunch", sub_type: "Walking" }),
];

beforeEach(() => vi.clearAllMocks());

describe("BuildLogForm", () => {
  it("shows the variation picker with no form when no initialSubType is given", () => {
    render(
      <BuildLogForm
        userId="user-1"
        habitId="habit-1"
        habitName="Movement"
        configs={CONFIGS}
        date="2026-05-14"
      />,
    );

    expect(screen.getByText("Which variation?")).toBeInTheDocument();
    expect(screen.queryByText("How did you show up?")).not.toBeInTheDocument();
  });

  it("shows the form for that variation immediately when initialSubType is given", () => {
    render(
      <BuildLogForm
        userId="user-1"
        habitId="habit-1"
        habitName="Movement"
        configs={CONFIGS}
        date="2026-05-14"
        initialSubType="Reading"
      />,
    );

    expect(screen.getByText("How did you show up?")).toBeInTheDocument();
  });

  it("navigates to the habit journal after logging a habit with no variations", () => {
    render(
      <BuildLogForm
        userId="user-1"
        habitId="habit-1"
        habitName="Movement"
        configs={[]}
        date="2026-05-14"
      />,
    );

    fireEvent.click(screen.getByText("Full session"));
    fireEvent.click(screen.getByText("Log it"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/build/$habitId",
      params: { habitId: "habit-1" },
    });
  });

  it("navigates to the habit journal after logging a single variation", () => {
    render(
      <BuildLogForm
        userId="user-1"
        habitId="habit-1"
        habitName="Movement"
        configs={CONFIGS}
        date="2026-05-14"
        initialSubType="Reading"
      />,
    );

    fireEvent.click(screen.getByText("Full session"));
    fireEvent.click(screen.getByText("Log it"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/build/$habitId",
      params: { habitId: "habit-1" },
    });
  });
});
