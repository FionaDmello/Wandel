import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HabitDriftModal } from "@/features/protocols/HabitDriftModal";
import type { PendingProtocol } from "@/types/protocols";

vi.mock("@/hooks/useBuildHabits", () => ({
  useBuildHabit: () => ({ data: undefined }),
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
  it("Skip for now calls onDismiss", () => {
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
  });

  it("'I am returning' is purely decorative — just calls onComplete", () => {
    const onComplete = vi.fn();

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

    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("does the same for a build habit", () => {
    const onComplete = vi.fn();
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

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
