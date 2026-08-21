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
      screen.getByLabelText(buildDayCellLabel(14, false, true, 0)),
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
      screen.getByLabelText(buildDayCellLabel(14, false, false, 0)),
    ).toBeInTheDocument();
  });

  it("shows zero break dots for a future date", () => {
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

    // TODAY is mocked to 2026-05-20; the 25th is a future date in the
    // same month, so it must show no break dot at all regardless of the
    // habit having no slip or urge logged.
    expect(
      screen.getByLabelText(buildDayCellLabel(25, false, false, 0)),
    ).toBeInTheDocument();
  });

  it("still computes the break dot normally for today", () => {
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

    // TODAY itself (the 20th) is not future, so its dot should compute
    // normally -- the habit has no slip, so it's still clean.
    expect(
      screen.getByLabelText(buildDayCellLabel(20, false, true, 0)),
    ).toBeInTheDocument();
  });
});

describe("CalendarGrid — dot consolidation (#10)", () => {
  const HABIT_2: Habit = {
    ...HABIT,
    id: "habit-2",
    name: "Nicotine",
  };

  it("shows a single clean-day dot when multiple break habits are all clean", () => {
    render(
      <CalendarGrid
        year={2026}
        month={5}
        engineActivityDates={[]}
        breakHabits={[HABIT, HABIT_2]}
        breakSlipEvents={[]}
        buildObs={[]}
        onDayTap={() => {}}
      />,
    );

    // Two clean habits: the label carries the boolean, and this cell's own
    // dot count must stay at 1 regardless of how many habits are clean.
    const dayCell = screen.getByLabelText(
      buildDayCellLabel(14, false, true, 0),
    );
    expect(dayCell.querySelectorAll(".bg-teal")).toHaveLength(1);
  });

  it("shows no clean-day dot when only one of several break habits slipped", () => {
    render(
      <CalendarGrid
        year={2026}
        month={5}
        engineActivityDates={[]}
        breakHabits={[HABIT, HABIT_2]}
        breakSlipEvents={[makeSlipEvent("habit-2", "2026-05-14")]}
        buildObs={[]}
        onDayTap={() => {}}
      />,
    );

    expect(
      screen.getByLabelText(buildDayCellLabel(14, false, false, 0)),
    ).toBeInTheDocument();
  });

  it("shows a single build dot when multiple build habits are logged the same day", () => {
    render(
      <CalendarGrid
        year={2026}
        month={5}
        engineActivityDates={[]}
        breakHabits={[]}
        breakSlipEvents={[]}
        buildObs={[
          {
            id: "obs-1",
            habit_id: "build-habit-1",
            user_id: "user-1",
            date: "2026-05-14",
            sub_type: null,
            mark_type: "full",
            mark_label: "Full session",
            note: null,
            logged_at: "2026-05-14T09:00:00Z",
          },
          {
            id: "obs-2",
            habit_id: "build-habit-2",
            user_id: "user-1",
            date: "2026-05-14",
            sub_type: null,
            mark_type: "full",
            mark_label: "Full session",
            note: null,
            logged_at: "2026-05-14T09:00:00Z",
          },
        ]}
        onDayTap={() => {}}
      />,
    );

    const dayCell = screen.getByLabelText(
      buildDayCellLabel(14, false, false, 2),
    );
    expect(dayCell.querySelectorAll(".bg-amber")).toHaveLength(1);
  });
});
