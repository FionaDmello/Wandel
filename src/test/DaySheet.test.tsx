import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DaySheet } from "@/features/history/DaySheet";
import type {
  BreakObservationWithEmotions,
  BuildObservation,
  HabitWithConfigs,
} from "@/types/database";

const navigateMock = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigateMock,
}));

beforeEach(() => {
  navigateMock.mockClear();
});

const DEFAULT_PROPS = {
  date: "2026-05-27",
  hasEngineActivity: false,
  breakObs: [],
  buildObs: [],
  breakHabits: [],
  buildHabits: [],
  isFuture: false,
  onClose: vi.fn(),
};

describe("DaySheet", () => {
  it("sets dialog role and aria-modal on the sheet", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("focuses the sheet on mount", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("returns focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<DaySheet {...DEFAULT_PROPS} />);
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Escape while an IME composition is in progress", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sets aria-label from the display date", () => {
    render(<DaySheet {...DEFAULT_PROPS} date="2026-05-27" />);
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Wednesday, 27 May",
    );
  });

  it("wraps Shift+Tab from the first focusable element back to the last", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();
  });
});

function makeHabit(overrides: Partial<HabitWithConfigs>): HabitWithConfigs {
  return {
    id: "habit-1",
    user_id: "user-1",
    category: "break",
    name: "Nail biting",
    status: "active",
    paused_at: null,
    sort_order: 0,
    created_at: "2026-05-01T00:00:00Z",
    configs: [],
    ...overrides,
  };
}

const BREAK_OBS: BreakObservationWithEmotions = {
  id: "obs-1",
  user_id: "user-1",
  habit_id: "habit-1",
  job: "Boredom",
  context: "At my desk",
  urge_intensity: 6,
  aftermath: null,
  logged_at: "2026-05-27T10:00:00Z",
  emotions: [],
};

const BUILD_OBS: BuildObservation = {
  id: "obs-1",
  habit_id: "habit-1",
  user_id: "user-1",
  date: "2026-05-27",
  sub_type: null,
  mark_type: "full",
  mark_label: "Full session",
  note: null,
  logged_at: "2026-05-27T10:00:00Z",
};

describe("DaySheet — deactivated habits (#28)", () => {
  it("hides a deactivated break habit with no observation that day", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        breakHabits={[makeHabit({ status: "deactivated" })]}
      />,
    );
    expect(screen.queryByText("Nail biting")).not.toBeInTheDocument();
    expect(screen.queryByText("Add it")).not.toBeInTheDocument();
  });

  it("still shows a deactivated break habit that has a real observation that day", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        breakHabits={[makeHabit({ status: "deactivated" })]}
        breakObs={[BREAK_OBS]}
      />,
    );
    expect(screen.getByText("Nail biting")).toBeInTheDocument();
    expect(screen.getByText("Boredom")).toBeInTheDocument();
    expect(screen.queryByText("Add it")).not.toBeInTheDocument();
  });

  it("hides a deactivated build habit with no observation that day", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        buildHabits={[makeHabit({ category: "build", status: "deactivated" })]}
      />,
    );
    expect(screen.queryByText("Nail biting")).not.toBeInTheDocument();
    expect(screen.queryByText("Add it")).not.toBeInTheDocument();
  });

  it("still shows a deactivated build habit that has a real observation that day", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        buildHabits={[makeHabit({ category: "build", status: "deactivated" })]}
        buildObs={[BUILD_OBS]}
      />,
    );
    expect(screen.getByText("Nail biting")).toBeInTheDocument();
    expect(screen.getByText("Full session")).toBeInTheDocument();
    expect(screen.queryByText("Add it")).not.toBeInTheDocument();
  });

  it("still shows an active habit with no observation, prompting to add it", () => {
    render(<DaySheet {...DEFAULT_PROPS} breakHabits={[makeHabit({})]} />);
    expect(screen.getByText("Nail biting")).toBeInTheDocument();
    expect(screen.getByText("Add it")).toBeInTheDocument();
  });

  it("shows the empty state when the only habits are hidden deactivated ones", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        breakHabits={[makeHabit({ status: "deactivated" })]}
        buildHabits={[makeHabit({ category: "build", status: "deactivated" })]}
      />,
    );
    expect(screen.getByText("Nothing logged this day.")).toBeInTheDocument();
  });
});

describe("DaySheet — Add it navigates to that habit's journal, keeping the date", () => {
  it("navigates to /break/$habitId with the date when adding a break habit", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        date="2026-05-14"
        breakHabits={[makeHabit({})]}
      />,
    );
    fireEvent.click(screen.getByText("Add it"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/break/$habitId",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14" },
    });
  });

  it("navigates to /build/$habitId with the date when adding a build habit", () => {
    render(
      <DaySheet
        {...DEFAULT_PROPS}
        date="2026-05-14"
        buildHabits={[makeHabit({ category: "build" })]}
      />,
    );
    fireEvent.click(screen.getByText("Add it"));
    expect(navigateMock).toHaveBeenCalledWith({
      to: "/build/$habitId",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14" },
    });
  });
});
