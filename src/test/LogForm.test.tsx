import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LogForm } from "@/features/break/LogForm";
import type { HabitConfig } from "@/types/database";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockLogObservation = vi.fn(
  (
    _payload: { habit_id: string },
    options?: { onSuccess?: (obs: { id: string }) => void },
  ) => options?.onSuccess?.({ id: "new-obs-1" }),
);
const mockUpdateObservation = vi.fn(
  (_payload: { id: string }, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
);
const mockUpdateAftermath = vi.fn(
  (_payload: unknown, options?: { onSuccess?: () => void }) =>
    options?.onSuccess?.(),
);

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

  it("shows the aftermath step after logging, without navigating yet", () => {
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

    expect(screen.getByText("How do you feel now?")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to the habit journal after skipping the aftermath step", () => {
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
    fireEvent.click(screen.getByText("Skip"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/break/$habitId",
      params: { habitId: "habit-1" },
    });
  });

  it("navigates to the habit journal after saving the aftermath step", () => {
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
    fireEvent.click(screen.getByText("Save aftermath"));

    expect(mockUpdateAftermath).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/break/$habitId",
      params: { habitId: "habit-1" },
    });
  });

  it("navigates to the habit journal after editing an entry and skipping aftermath", async () => {
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
    fireEvent.click(screen.getByText("Skip"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/break/$habitId",
      params: { habitId: "habit-1" },
    });
  });
});
