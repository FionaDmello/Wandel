import { describe, expect, it } from "vitest";

import { resolveTourTrigger } from "@/features/tour/resolveTourTrigger";

function profile(overrides: {
  tour_completed: boolean;
  habit_intro_seen: boolean;
}) {
  return overrides;
}

describe("resolveTourTrigger", () => {
  it("returns part1 when tour is not completed and on /engine", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: false, habit_intro_seen: false }),
      "/engine",
      false,
    );
    expect(result).toBe("part1");
  });

  it("returns null when tour is not completed but not on /engine", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: false, habit_intro_seen: false }),
      "/break",
      false,
    );
    expect(result).toBeNull();
  });

  it("returns part2 on an active break habit screen once tour is completed", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: false }),
      "/break/abc-123",
      false,
    );
    expect(result).toBe("part2");
  });

  it("returns part2 on a build habit screen too", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: false }),
      "/build/xyz-789",
      false,
    );
    expect(result).toBe("part2");
  });

  it("returns null on the break list screen (no habit id)", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: false }),
      "/break",
      false,
    );
    expect(result).toBeNull();
  });

  it("returns null when habit_intro_seen is already true", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: true }),
      "/break/abc-123",
      false,
    );
    expect(result).toBeNull();
  });

  it("returns null on a habit screen when a protocol is pending, even if part2 would otherwise fire", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: false }),
      "/break/abc-123",
      true,
    );
    expect(result).toBeNull();
  });

  it("returns null when both flags are already true", () => {
    const result = resolveTourTrigger(
      profile({ tour_completed: true, habit_intro_seen: true }),
      "/engine",
      false,
    );
    expect(result).toBeNull();
  });
});
