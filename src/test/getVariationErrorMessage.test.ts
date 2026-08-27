import { describe, expect, it } from "vitest";

import { getVariationErrorMessage } from "@/features/build/getVariationErrorMessage";

describe("getVariationErrorMessage", () => {
  it("returns null when there is no error", () => {
    expect(getVariationErrorMessage(null)).toBeNull();
  });

  it("returns a friendly message for a unique-violation error", () => {
    const error = { code: "23505", message: "duplicate key value" };
    expect(getVariationErrorMessage(error)).toBe(
      "A variation with this name already exists.",
    );
  });

  it("returns a generic fallback for any other error shape", () => {
    const error = { code: "42P01", message: "relation does not exist" };
    expect(getVariationErrorMessage(error)).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("returns a generic fallback for a plain Error instance", () => {
    expect(getVariationErrorMessage(new Error("network failure"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
