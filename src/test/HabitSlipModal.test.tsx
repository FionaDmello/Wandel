import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HabitSlipContext } from "@/features/protocols/HabitSlipModal";
import { HabitSlipModal } from "@/features/protocols/HabitSlipModal";

const mockLogBreakObservation = vi.fn();
const mockLogSlipDrift = vi.fn();
const mockLogStandingUp = vi.fn();

vi.mock("@/hooks/useBreakHabits", () => ({
  useBreakHabit: () => ({ data: undefined }),
}));

vi.mock("@/hooks/useBreakObservations", () => ({
  useLogBreakObservation: () => ({ mutateAsync: mockLogBreakObservation }),
}));

vi.mock("@/hooks/useSlipDriftLog", () => ({
  useLogSlipDrift: () => ({ mutateAsync: mockLogSlipDrift }),
}));

vi.mock("@/hooks/useStandingUpLog", () => ({
  useLogStandingUp: () => ({ mutateAsync: mockLogStandingUp }),
}));

const habit: HabitSlipContext = {
  habitId: "habit-1",
  trackType: "break",
  trackName: "Meditation",
};

describe("HabitSlipModal", () => {
  it("Skip for now calls onDismiss and saves nothing", () => {
    const onDismiss = vi.fn();
    render(
      <HabitSlipModal
        habit={habit}
        userId="user-1"
        onDismiss={onDismiss}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Skip for now"));

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(mockLogBreakObservation).not.toHaveBeenCalled();
    expect(mockLogSlipDrift).not.toHaveBeenCalled();
    expect(mockLogStandingUp).not.toHaveBeenCalled();
  });

  it("completing the flow for a break habit logs the slip but never writes standing_up_log", async () => {
    const onComplete = vi.fn();
    mockLogBreakObservation.mockResolvedValue({});
    mockLogSlipDrift.mockResolvedValue({});

    render(
      <HabitSlipModal
        habit={habit}
        userId="user-1"
        onDismiss={vi.fn()}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Just this slip"));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("One slip is weather."));

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());

    expect(mockLogBreakObservation).toHaveBeenCalledWith({
      habit_id: "habit-1",
      job: undefined,
      emotions: [],
    });
    expect(mockLogSlipDrift).toHaveBeenCalledWith({
      track_type: "break",
      type: "slip",
      habit_id: "habit-1",
      job_id: null,
      cause_category: null,
      emotional_state_before: null,
      all_or_nothing_stage: "at_the_slip",
      protocol_completed: true,
    });
    expect(mockLogStandingUp).not.toHaveBeenCalled();
  });
});
