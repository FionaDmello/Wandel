import { describe, expect, it } from "vitest";

import { getOverdueSundays } from "@/features/history/getOverdueSundays";

describe("getOverdueSundays", () => {
  // 2026-05-20 is a Wednesday. Most recent Sundays: 05-17, 05-10, 05-03.
  const TODAY = new Date(2026, 4, 20);
  const LONG_AGO = new Date(2020, 0, 1);

  it("returns nothing when every recent Sunday is reviewed", () => {
    const result = getOverdueSundays(
      ["2026-05-17", "2026-05-10", "2026-05-03"],
      LONG_AGO,
      TODAY,
    );
    expect(result).toEqual([]);
  });

  it("returns unreviewed past Sundays, most-recent-first", () => {
    const result = getOverdueSundays([], LONG_AGO, TODAY);
    expect(result).toEqual(["2026-05-17", "2026-05-10", "2026-05-03"]);
  });

  it("excludes Sundays before the signup date", () => {
    const result = getOverdueSundays([], new Date(2026, 4, 12), TODAY);
    expect(result).toEqual(["2026-05-17"]);
  });

  it("excludes today, even when today is an unreviewed Sunday", () => {
    const sunday = new Date(2026, 4, 17);
    const result = getOverdueSundays([], LONG_AGO, sunday);
    expect(result).toEqual(["2026-05-10", "2026-05-03"]);
  });

  it("still reports older missed Sundays when today is an unreviewed Sunday", () => {
    const sunday = new Date(2026, 4, 17);
    const result = getOverdueSundays(["2026-05-17"], LONG_AGO, sunday);
    expect(result).toEqual(["2026-05-10", "2026-05-03"]);
  });
});
