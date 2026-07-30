import { describe, expect, it } from "vitest";

import { isDuplicateVariationName } from "@/features/build/isDuplicateVariationName";

describe("isDuplicateVariationName", () => {
  it("returns false when no existing name matches", () => {
    expect(isDuplicateVariationName(["Gym"], "Yoga")).toBe(false);
  });

  it("returns true on an exact match", () => {
    expect(isDuplicateVariationName(["Gym", "Yoga"], "Gym")).toBe(true);
  });

  it("returns true on a case-insensitive match", () => {
    expect(isDuplicateVariationName(["Gym"], "gym")).toBe(true);
  });

  it("returns false for an empty list", () => {
    expect(isDuplicateVariationName([], "Gym")).toBe(false);
  });
});
