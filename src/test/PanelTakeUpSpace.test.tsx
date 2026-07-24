import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PanelTakeUpSpace } from "@/features/engine/PanelTakeUpSpace";
import type { TakeUpSpaceEntry, TakeUpSpaceTag } from "@/types/takeUpSpace";

function makeEntry(n: number): TakeUpSpaceEntry {
  return {
    id: `tus-${n}`,
    user_id: "user-1",
    date: "2026-05-29",
    mode: "in_the_moment",
    situation: `Situation ${n}`,
    action: null,
    cost: null,
    need: null,
    choice_text: null,
    teaching: null,
    tag_ids: [],
    tag_names: [],
    choice_outcome: null,
    panel_tag: null,
    status: "complete",
    created_at: `2026-05-29T0${n}:00:00Z`,
    completed_at: `2026-05-29T0${n}:30:00Z`,
  };
}

function makeTag(name: string): TakeUpSpaceTag {
  return {
    id: `tag-${name}`,
    user_id: "user-1",
    name,
    is_default: true,
    active: true,
    created_at: "2026-05-01T00:00:00Z",
  };
}

let entriesData: TakeUpSpaceEntry[] = [];
let tagsData: TakeUpSpaceTag[] = [];
const mockSeedMutate = vi.fn();

vi.mock("@/features/engine/TakeUpSpaceTagEditor", () => ({
  TakeUpSpaceTagEditor: () => <div>tag-editor</div>,
}));

vi.mock("@/features/engine/TakeUpSpaceReferenceCard", () => ({
  TakeUpSpaceReferenceCard: () => <div>reference-card</div>,
}));

vi.mock("@/features/engine/TakeUpSpaceLogger", () => ({
  TakeUpSpaceLogger: () => <div>tus-logger</div>,
}));

vi.mock("@/hooks/useTakeUpSpace", () => ({
  useTakeUpSpaceEntries: () => ({ data: entriesData }),
}));

vi.mock("@/hooks/useTakeUpSpaceTags", () => ({
  useTakeUpSpaceTags: () => ({ data: tagsData }),
  useSeedDefaultTags: () => ({
    mutate: mockSeedMutate,
    isPending: false,
    isSuccess: false,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  entriesData = [];
  tagsData = [];
});

describe("PanelTakeUpSpace", () => {
  it("renders the panel header title, subtitle, and number", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(screen.getByText("Take Up Space")).toBeTruthy();
    expect(screen.getByText("Learning to stay with yourself")).toBeTruthy();
    expect(screen.getByText("04")).toBeTruthy();
  });

  it("renders the Tags label, Edit button, and chips", () => {
    tagsData = [makeTag("settling")];
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(screen.getByText("Tags")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("settling")).toBeTruthy();
  });

  it("seeds default tags when none exist", () => {
    tagsData = [];
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(mockSeedMutate).toHaveBeenCalledOnce();
  });

  it("does not seed when tags already exist", () => {
    tagsData = [makeTag("settling")];
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(mockSeedMutate).not.toHaveBeenCalled();
  });

  it("shows empty-state message when there are no entries", () => {
    entriesData = [];
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(screen.getByText("What you notice lives here.")).toBeTruthy();
  });

  it("hides empty-state message and renders entries when entries exist", () => {
    entriesData = [makeEntry(1)];
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(screen.queryByText("What you notice lives here.")).toBeNull();
    expect(screen.getByText("Situation 1")).toBeTruthy();
  });

  it("renders the filter button and Notice button", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    expect(screen.getByLabelText("Filter entries")).toBeTruthy();
    expect(screen.getByText("Notice")).toBeTruthy();
  });

  it("opens TakeUpSpaceLogger when Notice button is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    fireEvent.click(screen.getByText("Notice"));
    expect(screen.getByText("tus-logger")).toBeInTheDocument();
  });

  it("renders PauseOverlay hidden", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    const overlay = screen.getByText("You noticed.");
    expect(overlay.parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens TakeUpSpaceTagEditor when Edit is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("tag-editor")).toBeInTheDocument();
  });

  it("opens TakeUpSpaceReferenceCard when info button is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" />);
    fireEvent.click(screen.getByLabelText("About Take Up Space"));
    expect(screen.getByText("reference-card")).toBeInTheDocument();
  });
});
