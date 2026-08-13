import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HabitDriftModal } from "@/features/protocols/HabitDriftModal";
import type { PendingProtocol } from "@/types/protocols";

const mockLogSlipDrift = vi.fn();
const mockLogStandingUp = vi.fn();

vi.mock("@/hooks/useBuildHabits", () => ({
  useBuildHabit: () => ({ data: undefined }),
}));

vi.mock("@/hooks/useSlipDriftLog", () => ({
  useLogSlipDrift: () => ({ mutateAsync: mockLogSlipDrift }),
}));

vi.mock("@/hooks/useStandingUpLog", () => ({
  useLogStandingUp: () => ({ mutateAsync: mockLogStandingUp }),
}));

const breakProtocol: PendingProtocol = {
  id: "habit_drift",
  habitId: "habit-1",
  trackType: "break",
  trackName: "Smoking",
  driftDays: 3,
  currentStep: 0,
};

describe("HabitDriftModal", () => {
  it("Skip for now calls onDismiss and saves nothing", () => {
    const onDismiss = vi.fn();
    render(
      <HabitDriftModal
        protocol={breakProtocol}
        userId="user-1"
        onDismiss={onDismiss}
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Skip for now"));

    expect(onDismiss).toHaveBeenCalledOnce();
    expect(mockLogSlipDrift).not.toHaveBeenCalled();
    expect(mockLogStandingUp).not.toHaveBeenCalled();
  });

  it("completing the flow for a break habit logs drift but never writes standing_up_log", async () => {
    const onComplete = vi.fn();
    mockLogSlipDrift.mockResolvedValue({});

    render(
      <HabitDriftModal
        protocol={breakProtocol}
        userId="user-1"
        onDismiss={vi.fn()}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("I am returning."));

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());

    expect(mockLogSlipDrift).toHaveBeenCalledWith({
      track_type: "break",
      type: "drift",
      habit_id: "habit-1",
      cause_category: null,
      protocol_completed: true,
    });
    expect(mockLogStandingUp).not.toHaveBeenCalled();
  });

  it("completing the flow for a build habit logs drift with track_type build", async () => {
    const onComplete = vi.fn();
    mockLogSlipDrift.mockResolvedValue({});
    const buildProtocol: PendingProtocol = {
      id: "habit_drift",
      habitId: "habit-2",
      trackType: "build",
      trackName: "Running",
      driftDays: 4,
      currentStep: 0,
    };

    render(
      <HabitDriftModal
        protocol={buildProtocol}
        userId="user-1"
        onDismiss={vi.fn()}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("I am returning."));

    await waitFor(() => expect(onComplete).toHaveBeenCalledOnce());

    expect(mockLogSlipDrift).toHaveBeenCalledWith({
      track_type: "build",
      type: "drift",
      habit_id: "habit-2",
      cause_category: null,
      protocol_completed: true,
    });
  });
});
