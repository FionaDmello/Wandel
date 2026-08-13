import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogForm } from "@/features/break/LogForm";
import type { HabitConfig } from "@/types/database";

const mockLogObservation = vi.fn();
const mockUpdateObservation = vi.fn();
const mockUpdateAftermath = vi.fn();

vi.mock("@/hooks/useBreakObservations", () => ({
  useLogBreakObservation: () => ({
    mutate: mockLogObservation,
    isPending: false,
  }),
  useUpdateBreakObservationAftermath: () => ({
    mutate: mockUpdateAftermath,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useUpdateBreakObservation", () => ({
  useUpdateBreakObservation: () => ({
    mutate: mockUpdateObservation,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useBreakObservationById", () => ({
  useBreakObservationById: (_userId: string, id: string) =>
    id
      ? {
          data: {
            id: "obs-1",
            job: "Boredom",
            context: "At my desk",
            urge_intensity: 6,
            emotions: [{ id: "e1", observation_id: "obs-1", value: "Tired" }],
          },
          isLoading: false,
        }
      : { data: undefined, isLoading: false },
}));

const JOB_CONFIG: HabitConfig = {
  id: "config-1",
  habit_id: "habit-1",
  key: "job",
  value: "Boredom",
  sub_type: null,
  sort_order: 0,
  created_at: "",
};

beforeEach(() => vi.clearAllMocks());

describe("LogForm", () => {
  it("inserts a new observation when no entryId is given", () => {
    render(
      <LogForm
        userId="user-1"
        habitId="habit-1"
        jobConfigs={[JOB_CONFIG]}
        date="2026-05-14"
      />,
    );

    fireEvent.click(screen.getByText("Boredom"));
    fireEvent.click(screen.getByText("Tired"));
    fireEvent.click(screen.getByText("Log it"));

    expect(mockLogObservation).toHaveBeenCalled();
    expect(mockUpdateObservation).not.toHaveBeenCalled();
  });

  it("pre-fills from the existing entry and updates it when entryId is given", async () => {
    render(
      <LogForm
        userId="user-1"
        habitId="habit-1"
        jobConfigs={[JOB_CONFIG]}
        date="2026-05-14"
        entryId="obs-1"
      />,
    );

    await waitFor(() =>
      expect(screen.getByDisplayValue("At my desk")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Log it"));

    expect(mockUpdateObservation).toHaveBeenCalledWith(
      expect.objectContaining({ id: "obs-1", job: "Boredom" }),
      expect.anything(),
    );
    expect(mockLogObservation).not.toHaveBeenCalled();
  });
});
