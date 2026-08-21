import { describe, expect, it } from "vitest";

import { buildDayCellLabel } from "@/features/history/buildDayCellLabel";

describe("buildDayCellLabel", () => {
  it("returns just the day number when there's no activity", () => {
    expect(buildDayCellLabel(5, false, false, 0)).toBe("5");
  });

  it("includes engine activity", () => {
    expect(buildDayCellLabel(5, true, false, 0)).toBe("5 — Engine activity");
  });

  it("includes a clean break day", () => {
    expect(buildDayCellLabel(5, false, true, 0)).toBe("5 — Clean day");
  });

  it("pluralizes build logs correctly", () => {
    expect(buildDayCellLabel(5, false, false, 1)).toBe("5 — 1 build log");
    expect(buildDayCellLabel(5, false, false, 3)).toBe("5 — 3 build logs");
  });

  it("combines all three kinds of activity", () => {
    expect(buildDayCellLabel(12, true, true, 2)).toBe(
      "12 — Engine activity, Clean day, 2 build logs",
    );
  });
});
