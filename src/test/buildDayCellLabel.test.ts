import { describe, expect, it } from "vitest";

import { buildDayCellLabel } from "@/features/history/buildDayCellLabel";

describe("buildDayCellLabel", () => {
  it("returns just the day number when there's no activity", () => {
    expect(buildDayCellLabel(5, false, 0, 0)).toBe("5");
  });

  it("includes engine activity", () => {
    expect(buildDayCellLabel(5, true, 0, 0)).toBe("5 — Engine activity");
  });

  it("pluralizes break entries correctly", () => {
    expect(buildDayCellLabel(5, false, 1, 0)).toBe("5 — 1 break entry");
    expect(buildDayCellLabel(5, false, 2, 0)).toBe("5 — 2 break entries");
  });

  it("pluralizes build logs correctly", () => {
    expect(buildDayCellLabel(5, false, 0, 1)).toBe("5 — 1 build log");
    expect(buildDayCellLabel(5, false, 0, 3)).toBe("5 — 3 build logs");
  });

  it("combines all three kinds of activity", () => {
    expect(buildDayCellLabel(12, true, 1, 2)).toBe(
      "12 — Engine activity, 1 break entry, 2 build logs",
    );
  });
});
