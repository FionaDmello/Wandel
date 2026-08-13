import { describe, expect, it } from "vitest";

import { computeStandingUpResolutions } from "@/features/protocols/computeStandingUp";

const TODAY = "2026-05-14";

describe("computeStandingUpResolutions", () => {
  it("returns empty array when there are no fall dates", () => {
    expect(computeStandingUpResolutions([], TODAY)).toEqual([]);
  });

  it("resolves a single-day fall the day after it", () => {
    const result = computeStandingUpResolutions(["2026-05-10"], TODAY);
    expect(result).toEqual([
      { fallDate: "2026-05-10", returnDate: "2026-05-11", gapDays: 1 },
    ]);
  });

  it("treats a multi-day consecutive run as one episode with fall_date at the first day", () => {
    const result = computeStandingUpResolutions(
      ["2026-05-10", "2026-05-11", "2026-05-12"],
      TODAY,
    );
    expect(result).toEqual([
      { fallDate: "2026-05-10", returnDate: "2026-05-13", gapDays: 3 },
    ]);
  });

  it("resolves multiple stacked episodes separated by clean days", () => {
    const result = computeStandingUpResolutions(
      ["2026-05-01", "2026-05-05", "2026-05-06"],
      TODAY,
    );
    expect(result).toEqual([
      { fallDate: "2026-05-01", returnDate: "2026-05-02", gapDays: 1 },
      { fallDate: "2026-05-05", returnDate: "2026-05-07", gapDays: 2 },
    ]);
  });

  it("does not resolve a run that has no confirmed clean day yet", () => {
    const result = computeStandingUpResolutions(["2026-05-13"], TODAY);
    expect(result).toEqual([]);
  });

  it("does not resolve a run ending the day before today (unconfirmed)", () => {
    const result = computeStandingUpResolutions(
      ["2026-05-11", "2026-05-12", "2026-05-13"],
      TODAY,
    );
    expect(result).toEqual([]);
  });

  it("resolves earlier episodes even when a later one is still unresolved", () => {
    const result = computeStandingUpResolutions(
      ["2026-05-01", "2026-05-13"],
      TODAY,
    );
    expect(result).toEqual([
      { fallDate: "2026-05-01", returnDate: "2026-05-02", gapDays: 1 },
    ]);
  });

  it("dedupes and sorts unordered, duplicate fall dates", () => {
    const result = computeStandingUpResolutions(
      ["2026-05-10", "2026-05-10", "2026-05-09"],
      TODAY,
    );
    expect(result).toEqual([
      { fallDate: "2026-05-09", returnDate: "2026-05-11", gapDays: 2 },
    ]);
  });
});
