import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtocolOrchestrator } from "@/features/protocols/ProtocolOrchestrator";
import type { PendingProtocol } from "@/types/protocols";

let queueData: PendingProtocol[] = [];
const clearProtocolMock = vi.fn();

vi.mock("@/hooks/useSession", () => ({
  useSession: () => ({ session: { user: { id: "user-1" } }, loading: false }),
}));

vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({
    data: {
      id: "user-1",
      why_statement: null,
      reminder_index: 0,
      reminder_last_rotated: null,
      setup_complete: true,
      last_protocol_check: "2026-07-30",
      created_at: "",
      updated_at: "",
    },
  }),
  useUpdateProfile: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/hooks/usePendingProtocol", () => ({
  usePendingProtocols: () => ({ data: queueData, isSuccess: true }),
  useSetPendingProtocols: () => ({ mutate: vi.fn() }),
  useClearPendingProtocol: () => ({ mutate: clearProtocolMock }),
}));

vi.mock("@/hooks/useProtocolDetection", () => ({
  useProtocolDetection: () => ({ detected: [], isChecking: false }),
}));

vi.mock("@/hooks/useBuildHabits", () => ({
  useBuildHabit: () => ({ data: undefined }),
}));

vi.mock("@/hooks/useSlipDriftLog", () => ({
  useLogSlipDrift: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock("@/hooks/useStandingUpLog", () => ({
  useLogStandingUp: () => ({ mutateAsync: vi.fn() }),
}));

function makeHabitDrift(habitId: string, trackName: string): PendingProtocol {
  return {
    id: "habit_drift",
    habitId,
    trackType: "break",
    trackName,
    driftDays: 3,
    currentStep: 0,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  clearProtocolMock.mockClear();
  queueData = [
    makeHabitDrift("habit-1", "Meditation"),
    makeHabitDrift("habit-2", "Journaling"),
  ];
});

describe("ProtocolOrchestrator", () => {
  it("renders the next queued protocol correctly after dismissing the first, when both are the same modal type", () => {
    const { container } = render(<ProtocolOrchestrator />);

    expect(screen.getByText("Meditation")).toBeInTheDocument();

    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;
    fireEvent.click(backdrop);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(clearProtocolMock).toHaveBeenCalledOnce();
    expect(screen.getByText("Journaling")).toBeInTheDocument();
  });
});
