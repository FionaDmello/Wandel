import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { HabitSlipContext } from "@/features/protocols/HabitSlipModal";
import { HabitSlipModal } from "@/features/protocols/HabitSlipModal";

const mockLogSlipDrift = vi.fn();

vi.mock("@/hooks/useBreakHabits", () => ({
  useBreakHabit: () => ({ data: undefined }),
}));

vi.mock("@/hooks/useSlipDriftLog", () => ({
  useLogSlipDrift: () => ({ mutateAsync: mockLogSlipDrift }),
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
    expect(mockLogSlipDrift).not.toHaveBeenCalled();
  });

  it("completing the flow for a break habit logs only the slip, no observation", async () => {
    const onComplete = vi.fn();
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
  });
});
