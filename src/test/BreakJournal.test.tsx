import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BreakJournal } from "@/features/break/BreakJournal";
import type { HabitConfig } from "@/types/database";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/useBreakHabitObservations");
vi.mock("@/hooks/useBreakSlipEvents");
vi.mock("@/hooks/useStandingUpLog");

import { useBreakHabitObservations } from "@/hooks/useBreakHabitObservations";
import { useBreakSlipEvents } from "@/hooks/useBreakSlipEvents";
import { useStandingUpEntries } from "@/hooks/useStandingUpLog";

const JOB_CONFIG: HabitConfig = {
  id: "job-1",
  habit_id: "habit-1",
  key: "job",
  value: "Boredom",
  sub_type: null,
  sort_order: 0,
  created_at: "",
};

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

describe("BreakJournal", () => {
  it("shows an empty state when nothing has been logged", () => {
    vi.mocked(useBreakHabitObservations).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakHabitObservations>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);

    render(<BreakJournal userId="user-1" habitId="habit-1" configs={[]} />, {
      wrapper,
    });

    expect(screen.getByText("Nothing logged yet.")).toBeInTheDocument();
  });

  it("renders an observation and navigates with its entryId on Edit", () => {
    vi.mocked(useBreakHabitObservations).mockReturnValue({
      data: [
        {
          id: "obs-1",
          user_id: "user-1",
          habit_id: "habit-1",
          job: "Boredom",
          context: "At my desk",
          urge_intensity: 6,
          aftermath: null,
          logged_at: "2026-05-14T10:00:00Z",
          emotions: [{ id: "e1", observation_id: "obs-1", value: "Tired" }],
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakHabitObservations>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);

    render(<BreakJournal userId="user-1" habitId="habit-1" configs={[]} />, {
      wrapper,
    });

    expect(screen.getByText("Boredom")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Boredom"));

    expect(screen.getByText("At my desk")).toBeInTheDocument();
    expect(screen.getByText("Urge: 6/10")).toBeInTheDocument();
    expect(screen.getByText("Tired")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Edit"));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/break/$habitId/log",
      params: { habitId: "habit-1" },
      search: { date: "2026-05-14", entryId: "obs-1" },
    });
  });

  it("resolves the slip's job via configs and shows full labeled detail", () => {
    vi.mocked(useBreakHabitObservations).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakHabitObservations>);
    vi.mocked(useBreakSlipEvents).mockReturnValue({
      data: [
        {
          id: "slip-1",
          habit_id: "habit-1",
          triggered_at: "2026-05-12T00:00:00Z",
          job_id: "job-1",
          cause_category: "logistics",
          emotional_state_before: "Tired",
          all_or_nothing_stage: "at_the_slip",
        },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useBreakSlipEvents>);

    render(
      <BreakJournal userId="user-1" habitId="habit-1" configs={[JOB_CONFIG]} />,
      { wrapper },
    );

    fireEvent.click(screen.getByText("Slipped"));

    expect(screen.getByText("Boredom")).toBeInTheDocument();
    expect(screen.getByText("Logistics")).toBeInTheDocument();
    expect(screen.getByText("Just this slip")).toBeInTheDocument();
  });
});
