import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StandingUpCard } from "@/features/history/StandingUpCard";
import type { StandingUpEntry } from "@/types/database";
import type { StandingUpTrack } from "@/types/standingUp";

function makeEntry(id: string, trackName: string): StandingUpEntry {
  return {
    id,
    user_id: "user-1",
    habit_id: null,
    track_type: "engine",
    track_name: trackName,
    fall_date: "2026-05-01",
    return_date: "2026-05-08",
    gap_days: 3,
    protocol: "slip",
    created_at: "2026-05-08T00:00:00Z",
  };
}

describe("StandingUpCard", () => {
  it("renders nothing when given an empty tracks array", () => {
    const { container } = render(<StandingUpCard tracks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when every track has zero entries", () => {
    const tracks: StandingUpTrack[] = [
      { id: "engine", trackName: "Engine", entries: [] },
      { id: "habit-1", trackName: "Quit smoking", entries: [] },
    ];
    const { container } = render(<StandingUpCard tracks={tracks} />);
    expect(container.firstChild).toBeNull();
  });

  it("filters out empty tracks but keeps non-empty ones", () => {
    const tracks: StandingUpTrack[] = [
      { id: "engine", trackName: "Engine", entries: [] },
      {
        id: "habit-1",
        trackName: "Quit smoking",
        entries: [makeEntry("e1", "Quit smoking")],
      },
    ];
    render(<StandingUpCard tracks={tracks} />);
    expect(screen.getByText("Quit smoking")).toBeTruthy();
  });

  it("shows the 'Standing Up' header and defaults to open", () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "engine",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
    ];
    render(<StandingUpCard tracks={tracks} />);
    expect(screen.getByText("Standing Up")).toBeTruthy();
    expect(screen.getByText("Engine")).toBeTruthy();
  });

  it("collapses and reopens on header click", async () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "engine",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
    ];
    render(<StandingUpCard tracks={tracks} />);
    const toggle = screen.getByRole("button", { name: /standing up/i });

    await userEvent.click(toggle);
    expect(screen.queryByText("Engine")).toBeNull();

    await userEvent.click(toggle);
    expect(screen.getByText("Engine")).toBeTruthy();
  });

  it("renders tracks in the given order", () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "engine",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
      {
        id: "habit-1",
        trackName: "Quit smoking",
        entries: [makeEntry("e2", "Quit smoking")],
      },
    ];
    render(<StandingUpCard tracks={tracks} />);
    const names = screen
      .getAllByText(/Engine|Quit smoking/)
      .map((el) => el.textContent);
    expect(names).toEqual(["Engine", "Quit smoking"]);
  });

  it("renders a divider between tracks but not before the first or after the last", () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "engine",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
      {
        id: "habit-1",
        trackName: "Quit smoking",
        entries: [makeEntry("e2", "Quit smoking")],
      },
      {
        id: "habit-2",
        trackName: "Exercise",
        entries: [makeEntry("e3", "Exercise")],
      },
    ];
    const { container } = render(<StandingUpCard tracks={tracks} />);
    expect(container.querySelectorAll("hr")).toHaveLength(2);
  });

  it("renders no divider for a single track", () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "engine",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
    ];
    const { container } = render(<StandingUpCard tracks={tracks} />);
    expect(container.querySelectorAll("hr")).toHaveLength(0);
  });

  it("renders two tracks with the same display name as distinct rows when their ids differ", () => {
    const tracks: StandingUpTrack[] = [
      {
        id: "habit-1",
        trackName: "Engine",
        entries: [makeEntry("e1", "Engine")],
      },
      {
        id: "habit-2",
        trackName: "Engine",
        entries: [makeEntry("e2", "Engine")],
      },
    ];
    render(<StandingUpCard tracks={tracks} />);
    expect(screen.getAllByText("Engine")).toHaveLength(2);
  });
});
