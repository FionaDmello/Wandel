import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeUpSpaceTagSelector } from "@/features/engine/TakeUpSpaceTagSelector";
import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

function makeTag(overrides: Partial<TakeUpSpaceTag> = {}): TakeUpSpaceTag {
  return {
    id: "tag-1",
    user_id: "user-1",
    name: "settling",
    is_default: true,
    active: true,
    created_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

describe("TakeUpSpaceTagSelector", () => {
  it("renders active tags only", () => {
    const tags = [
      makeTag({ id: "t-1", name: "settling", active: true }),
      makeTag({ id: "t-2", name: "hidden", active: false }),
    ];
    render(
      <TakeUpSpaceTagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("settling")).toBeInTheDocument();
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("calls onToggle with the tag id when tapped", () => {
    const onToggle = vi.fn();
    const tags = [makeTag({ id: "t-1", name: "settling" })];
    render(
      <TakeUpSpaceTagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByText("settling"));
    expect(onToggle).toHaveBeenCalledWith("t-1");
  });

  it("reflects selection via aria-pressed", () => {
    const tags = [
      makeTag({ id: "t-1", name: "settling" }),
      makeTag({ id: "t-2", name: "work" }),
    ];
    render(
      <TakeUpSpaceTagSelector
        tags={tags}
        selectedIds={["t-1"]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("settling")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("work")).toHaveAttribute("aria-pressed", "false");
  });

  it("renders nothing when there are no active tags", () => {
    const tags = [makeTag({ active: false })];
    const { container } = render(
      <TakeUpSpaceTagSelector
        tags={tags}
        selectedIds={[]}
        onToggle={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
