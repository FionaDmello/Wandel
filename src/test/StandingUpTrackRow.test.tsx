import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StandingUpTrackRow } from "@/features/history/StandingUpTrackRow";
import type { StandingUpEntry } from "@/types/database";

function makeEntry(id: string, gapDays: number): StandingUpEntry {
  return {
    id,
    user_id: "user-1",
    habit_id: null,
    track_type: "engine",
    track_name: "Engine",
    fall_date: "2026-05-01",
    return_date: "2026-05-08",
    gap_days: gapDays,
    protocol: "slip",
    created_at: "2026-05-08T00:00:00Z",
  };
}

describe("StandingUpTrackRow", () => {
  it("shows the bare track name, not prefixed with 'Standing up'", () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 3)]} />,
    );
    expect(screen.getByText("Engine")).toBeTruthy();
    expect(screen.queryByText(/Standing up/)).toBeNull();
  });

  it("is collapsed by default — dots not visible", () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 3)]} />,
    );
    expect(screen.queryByText("3 days")).toBeNull();
  });

  it("expands on header click and shows entries", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 3)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("3 days")).toBeTruthy();
  });

  it("shows 'Same day' for gap_days 0", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 0)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Same day")).toBeTruthy();
  });

  it("shows 'Next morning' for gap_days 1", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 1)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Next morning")).toBeTruthy();
  });

  it("shows correct summary for a single entry", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 3)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(
      screen.getByText("You stood up 1 time. Fastest return: 3 days."),
    ).toBeTruthy();
  });

  it("shows correct summary for multiple entries", async () => {
    const entries = [
      makeEntry("e1", 0),
      makeEntry("e2", 5),
      makeEntry("e3", 2),
    ];
    render(<StandingUpTrackRow trackName="Engine" entries={entries} />);
    await userEvent.click(screen.getByRole("button"));
    expect(
      screen.getByText("You stood up 3 times. Fastest return: same day."),
    ).toBeTruthy();
  });

  it("shows fall and return dates when expanded", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 7)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText(/1 May.*8 May/)).toBeTruthy();
  });

  it("collapses again on second header click", async () => {
    render(
      <StandingUpTrackRow trackName="Engine" entries={[makeEntry("e1", 3)]} />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("3 days")).toBeTruthy();
    await userEvent.click(screen.getByRole("button"));
    expect(screen.queryByText("3 days")).toBeNull();
  });
});
