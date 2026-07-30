import { fireEvent, render, screen } from "@testing-library/react";
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
});
