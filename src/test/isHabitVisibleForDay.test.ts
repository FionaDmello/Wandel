import { describe, expect, it } from "vitest";

import { isHabitVisibleForDay } from "@/features/history/isHabitVisibleForDay";
import type { HabitStatus, HabitWithConfigs } from "@/types/database";

function makeHabit(status: HabitStatus): HabitWithConfigs {
  return {
    id: "habit-1",
    user_id: "user-1",
    category: "break",
    name: "Nail biting",
    status,
    paused_at: null,
    sort_order: 0,
    created_at: "2026-05-01T00:00:00Z",
    configs: [],
  };
}

describe("isHabitVisibleForDay", () => {
  it("hides a scheduled habit regardless of observation", () => {
    expect(isHabitVisibleForDay(makeHabit("scheduled"), false)).toBe(false);
    expect(isHabitVisibleForDay(makeHabit("scheduled"), true)).toBe(false);
  });

  it("hides a deactivated habit with no observation that day", () => {
    expect(isHabitVisibleForDay(makeHabit("deactivated"), false)).toBe(false);
  });

  it("shows a deactivated habit that has an observation that day", () => {
    expect(isHabitVisibleForDay(makeHabit("deactivated"), true)).toBe(true);
  });

  it("always shows an active habit", () => {
    expect(isHabitVisibleForDay(makeHabit("active"), false)).toBe(true);
    expect(isHabitVisibleForDay(makeHabit("active"), true)).toBe(true);
  });

  it("always shows a paused habit", () => {
    expect(isHabitVisibleForDay(makeHabit("paused"), false)).toBe(true);
    expect(isHabitVisibleForDay(makeHabit("paused"), true)).toBe(true);
  });
});
