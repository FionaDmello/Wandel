import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { buildDayCellLabel } from "@/features/history/buildDayCellLabel";
import { CalendarGrid } from "@/features/history/CalendarGrid";
import type { BreakSlipEvent } from "@/hooks/useBreakSlipEvents";
import type { Habit } from "@/types/database";

const TODAY = "2026-05-20";

beforeAll(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(new Date(TODAY));
});

afterAll(() => vi.useRealTimers());

const HABIT: Habit = {
  id: "habit-1",
  user_id: "user-1",
  category: "break",
  name: "Nail biting",
  status: "active",
  paused_at: null,
  sort_order: 0,
  created_at: "2026-05-01T00:00:00Z",
};

function makeSlipEvent(habitId: string, date: string): BreakSlipEvent {
  return {
    id: `slip-${date}`,
    habit_id: habitId,
    triggered_at: `${date}T09:00:00Z`,
    job_id: null,
    cause_category: null,
    emotional_state_before: null,
    all_or_nothing_stage: null,
  };
}

describe("CalendarGrid — break clean-day dot", () => {
  it("still shows the clean-day dot for a habit with only an urge log, no slip", () => {
    render(
      <CalendarGrid
        year={2026}
        month={5}
        engineActivityDates={[]}
        breakHabits={[HABIT]}
        breakSlipEvents={[]}
        buildObs={[]}
        onDayTap={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(buildDayCellLabel(14, false, 1, 0)),
    ).toBeInTheDocument();
  });

  it("hides the clean-day dot for a habit with a real slip logged", () => {
    render(
      <CalendarGrid
        year={2026}
        month={5}
        engineActivityDates={[]}
        breakHabits={[HABIT]}
        breakSlipEvents={[makeSlipEvent("habit-1", "2026-05-14")]}
        buildObs={[]}
        onDayTap={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(buildDayCellLabel(14, false, 0, 0)),
    ).toBeInTheDocument();
  });
});
