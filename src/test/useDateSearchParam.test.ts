import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDateSearchParam } from "@/hooks/useDateSearchParam";

let searchDate: string | undefined;

vi.mock("@tanstack/react-router", () => ({
  useSearch: () => ({ date: searchDate }),
}));

describe("useDateSearchParam", () => {
  it("returns the date search param when present", () => {
    searchDate = "2026-05-14";
    const { result } = renderHook(() => useDateSearchParam());
    expect(result.current).toBe("2026-05-14");
  });

  it("returns undefined when no date search param is present", () => {
    searchDate = undefined;
    const { result } = renderHook(() => useDateSearchParam());
    expect(result.current).toBeUndefined();
  });
});
