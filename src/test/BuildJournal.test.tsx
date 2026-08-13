import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BuildJournal } from "@/features/build/BuildJournal";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/useBuildHabitObservations");
vi.mock("@/hooks/useBuildSlipEvents");
vi.mock("@/hooks/useStandingUpLog");

import { useBuildHabitObservations } from "@/hooks/useBuildHabitObservations";
import { useBuildSlipEvents } from "@/hooks/useBuildSlipEvents";
import { useStandingUpEntries } from "@/hooks/useStandingUpLog";

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useStandingUpEntries).mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useStandingUpEntries>);
});

describe("BuildJournal", () => {
  it("shows an empty state when nothing has been logged", () => {
    vi.mocked(useBuildHabitObservations).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildHabitObservations>);
    vi.mocked(useBuildSlipEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildSlipEvents>);

    render(<BuildJournal userId="user-1" habitId="habit-1" />, { wrapper });

    expect(screen.getByText("Nothing logged yet.")).toBeInTheDocument();
  });

  it("renders an observation and expands it to show the note and edit button", () => {
    vi.mocked(useBuildHabitObservations).mockReturnValue({
      data: [
        {
          id: "obs-1",
          user_id: "user-1",
          habit_id: "habit-1",
          date: "2026-05-14",
          sub_type: "Reading",
          mark_type: "full",
          mark_label: "Full",
          note: "Read for 20 minutes",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildHabitObservations>);
    vi.mocked(useBuildSlipEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildSlipEvents>);

    render(<BuildJournal userId="user-1" habitId="habit-1" />, { wrapper });

    expect(screen.getByText("Reading · Full")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Reading · Full"));

    expect(screen.getByText("Read for 20 minutes")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Edit"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/build/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14" },
    });
  });

  it("renders a slip entry filtered to the current habit only", () => {
    vi.mocked(useBuildHabitObservations).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildHabitObservations>);
    vi.mocked(useBuildSlipEvents).mockReturnValue({
      data: [
        {
          id: "slip-1",
          habit_id: "habit-1",
          triggered_at: "2026-05-12T00:00:00Z",
          cause_category: "logistics",
          emotional_state_before: "Tired",
          all_or_nothing_stage: null,
        },
        {
          id: "slip-2",
          habit_id: "other-habit",
          triggered_at: "2026-05-12T00:00:00Z",
          cause_category: "logistics",
          emotional_state_before: null,
          all_or_nothing_stage: null,
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildSlipEvents>);

    render(<BuildJournal userId="user-1" habitId="habit-1" />, { wrapper });

    expect(screen.getAllByText("Slipped")).toHaveLength(1);
    fireEvent.click(screen.getByText("Slipped"));

    expect(screen.getByText("Tired")).toBeInTheDocument();
  });

  it("shows a standing-up-only day with no observation or slip", () => {
    vi.mocked(useBuildHabitObservations).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildHabitObservations>);
    vi.mocked(useBuildSlipEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBuildSlipEvents>);
    vi.mocked(useStandingUpEntries).mockReturnValue({
      data: [
        {
          id: "su-1",
          user_id: "user-1",
          habit_id: "habit-1",
          track_type: "build",
          track_name: "Meditation",
          fall_date: "2026-05-10",
          return_date: "2026-05-13",
          gap_days: 3,
          protocol: "drift",
          created_at: "2026-05-13T00:00:00Z",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useStandingUpEntries>);

    render(<BuildJournal userId="user-1" habitId="habit-1" />, { wrapper });

    expect(screen.getByText("Stood up — 3 days")).toBeInTheDocument();
  });
});
