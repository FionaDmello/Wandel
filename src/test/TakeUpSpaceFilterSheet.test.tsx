import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeUpSpaceFilterSheet } from "@/features/engine/TakeUpSpaceFilterSheet";
import type { TakeUpSpaceEntry, TakeUpSpaceFilters } from "@/types/takeUpSpace";

vi.mock("@/features/protocols/ProtocolModal", () => ({
  ProtocolModal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const EMPTY_FILTERS: TakeUpSpaceFilters = {
  outcomes: [],
  modes: [],
  panelTags: [],
  tagNames: [],
  noTags: false,
};

function makeEntry(
  overrides: Partial<TakeUpSpaceEntry> = {},
): TakeUpSpaceEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    date: "2026-07-28",
    mode: "in_the_moment",
    situation: "s",
    action: "a",
    cost: "c",
    need: "n",
    choice_text: "ct",
    teaching: "t",
    tag_ids: [],
    tag_names: [],
    choice_outcome: "paused",
    panel_tag: "none",
    status: "complete",
    created_at: "2026-07-28T00:00:00Z",
    completed_at: "2026-07-28T00:10:00Z",
    ...overrides,
  };
}

describe("TakeUpSpaceFilterSheet", () => {
  it("renders outcome, mode, and panel tag chips from constants", () => {
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("I overrode myself")).toBeInTheDocument();
    expect(screen.getByText("In the moment")).toBeInTheDocument();
    expect(screen.getByText("Self-Respect")).toBeInTheDocument();
  });

  it("renders No tags plus one chip per distinct tag name in entries", () => {
    render(
      <TakeUpSpaceFilterSheet
        entries={[
          makeEntry({ tag_names: ["work", "settling"] }),
          makeEntry({ tag_names: ["work"] }),
        ]}
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("No tags")).toBeInTheDocument();
    expect(screen.getByText("work")).toBeInTheDocument();
    expect(screen.getByText("settling")).toBeInTheDocument();
  });

  it("tapping an outcome chip calls onChange with the value added", () => {
    const onChange = vi.fn();
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={EMPTY_FILTERS}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("I overrode myself"));
    expect(onChange).toHaveBeenCalledWith({
      ...EMPTY_FILTERS,
      outcomes: ["override"],
    });
  });

  it("tapping a selected chip again removes it", () => {
    const onChange = vi.fn();
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={{ ...EMPTY_FILTERS, outcomes: ["override"] }}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("I overrode myself"));
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, outcomes: [] });
  });

  it("tapping No tags toggles the noTags flag", () => {
    const onChange = vi.fn();
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={EMPTY_FILTERS}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("No tags"));
    expect(onChange).toHaveBeenCalledWith({ ...EMPTY_FILTERS, noTags: true });
  });

  it("tapping Clear resets all filters", () => {
    const onChange = vi.fn();
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={{ ...EMPTY_FILTERS, outcomes: ["override"], noTags: true }}
        onChange={onChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Clear"));
    expect(onChange).toHaveBeenCalledWith(EMPTY_FILTERS);
  });

  it("does not render an Apply or Done button", () => {
    render(
      <TakeUpSpaceFilterSheet
        entries={[]}
        filters={EMPTY_FILTERS}
        onChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText("Apply")).not.toBeInTheDocument();
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
  });
});
