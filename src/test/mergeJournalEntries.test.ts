import { describe, expect, it } from "vitest";

import { mergeJournalEntries } from "@/features/journal/mergeJournalEntries";
import type { StandingUpEntry } from "@/types/database";

interface TestObs {
  date: string;
  label: string;
}
interface TestSlip {
  date: string;
  id: string;
}

function makeStandingUp(
  overrides: Partial<StandingUpEntry> = {},
): StandingUpEntry {
  return {
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
    ...overrides,
  };
}

describe("mergeJournalEntries", () => {
  it("returns an empty array for empty inputs", () => {
    expect(mergeJournalEntries<TestObs, TestSlip>([], [], [])).toEqual([]);
  });

  it("groups multiple observations on the same date together", () => {
    const observations: TestObs[] = [
      { date: "2026-05-14", label: "morning" },
      { date: "2026-05-14", label: "evening" },
    ];
    const result = mergeJournalEntries<TestObs, TestSlip>(observations, [], []);
    expect(result).toHaveLength(1);
    expect(result[0].observations).toHaveLength(2);
    expect(result[0].slips).toEqual([]);
    expect(result[0].standingUp).toBeNull();
  });

  it("creates a slip-only day", () => {
    const slips: TestSlip[] = [{ date: "2026-05-12", id: "slip-1" }];
    const result = mergeJournalEntries<TestObs, TestSlip>([], slips, []);
    expect(result).toEqual([
      { date: "2026-05-12", observations: [], slips, standingUp: null },
    ]);
  });

  it("creates a standing-up-only day with no observation or slip", () => {
    const standingUp = makeStandingUp({ return_date: "2026-05-13" });
    const result = mergeJournalEntries<TestObs, TestSlip>([], [], [standingUp]);
    expect(result).toEqual([
      {
        date: "2026-05-13",
        observations: [],
        slips: [],
        standingUp,
      },
    ]);
  });

  it("merges all three onto the same date when they coincide", () => {
    const observations: TestObs[] = [{ date: "2026-05-13", label: "effort" }];
    const slips: TestSlip[] = [{ date: "2026-05-13", id: "slip-1" }];
    const standingUp = makeStandingUp({ return_date: "2026-05-13" });
    const result = mergeJournalEntries<TestObs, TestSlip>(observations, slips, [
      standingUp,
    ]);
    expect(result).toEqual([
      {
        date: "2026-05-13",
        observations,
        slips,
        standingUp,
      },
    ]);
  });

  it("sorts distinct dates most recent first", () => {
    const observations: TestObs[] = [
      { date: "2026-05-01", label: "old" },
      { date: "2026-05-14", label: "new" },
      { date: "2026-05-07", label: "middle" },
    ];
    const result = mergeJournalEntries<TestObs, TestSlip>(observations, [], []);
    expect(result.map((d) => d.date)).toEqual([
      "2026-05-14",
      "2026-05-07",
      "2026-05-01",
    ]);
  });
});
