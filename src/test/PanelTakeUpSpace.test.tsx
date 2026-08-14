import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PanelTakeUpSpace } from "@/features/engine/PanelTakeUpSpace";
import type {
  TakeUpSpaceEntry,
  TakeUpSpaceFilters,
  TakeUpSpaceTag,
} from "@/types/takeUpSpace";

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
let draftData: TakeUpSpaceEntry | null = null;
let tagsData: TakeUpSpaceTag[] = [];
const mockSeedMutate = vi.fn();
let mockCreateMutate = vi.fn();
let mockCreateIsPending = false;
let mockAbandonMutate = vi.fn();
let mockAbandonIsPending = false;

vi.mock("@/features/engine/TakeUpSpaceTagEditor", () => ({
  TakeUpSpaceTagEditor: () => <div>tag-editor</div>,
}));

vi.mock("@/features/engine/TakeUpSpaceReferenceCard", () => ({
  TakeUpSpaceReferenceCard: () => <div>reference-card</div>,
}));

vi.mock("@/features/engine/TakeUpSpaceLogger", () => ({
  TakeUpSpaceLogger: ({ onComplete }: { onComplete: () => void }) => (
    <div>
      tus-logger
      <button type="button" onClick={onComplete}>
        mock-log-complete
      </button>
    </div>
  ),
}));

vi.mock("@/features/engine/TakeUpSpaceCostEditor", () => ({
  TakeUpSpaceCostEditor: ({ onClose }: { onClose: () => void }) => (
    <div>
      cost-editor
      <button type="button" onClick={onClose}>
        mock-cost-close
      </button>
    </div>
  ),
}));

vi.mock("@/features/engine/TakeUpSpaceFilterSheet", () => ({
  TakeUpSpaceFilterSheet: ({
    onChange,
    onClose,
  }: {
    onChange: (filters: TakeUpSpaceFilters) => void;
    onClose: () => void;
  }) => (
    <div>
      filter-sheet
      <button
        type="button"
        onClick={() =>
          onChange({
            outcomes: ["override"],
            modes: [],
            panelTags: [],
            tagNames: [],
            noTags: false,
          })
        }
      >
        mock-set-filter
      </button>
      <button type="button" onClick={onClose}>
        mock-filter-close
      </button>
    </div>
  ),
}));

vi.mock("@/hooks/useTakeUpSpace", () => ({
  useTakeUpSpaceEntries: () => ({ data: entriesData }),
  useActiveDraft: () => ({ data: draftData }),
  useCreateTakeUpSpaceEntry: () => ({
    mutate: mockCreateMutate,
    isPending: mockCreateIsPending,
  }),
  useAbandonDraft: () => ({
    mutate: mockAbandonMutate,
    isPending: mockAbandonIsPending,
  }),
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
  draftData = null;
  tagsData = [];
  mockCreateMutate = vi.fn(
    (
      _payload: { date: string },
      options?: { onSuccess?: (entry: TakeUpSpaceEntry) => void },
    ) => {
      options?.onSuccess?.(makeEntry(99));
    },
  );
  mockCreateIsPending = false;
  mockAbandonMutate = vi.fn(
    (_id: string, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    },
  );
  mockAbandonIsPending = false;
});

describe("PanelTakeUpSpace", () => {
  it("renders the panel header title, subtitle, and number", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByText("Take Up Space")).toBeTruthy();
    expect(screen.getByText("Learning to stay with yourself")).toBeTruthy();
    expect(screen.getByText("04")).toBeTruthy();
  });

  it("renders the Tags label, Edit button, and chips", () => {
    tagsData = [makeTag("settling")];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByText("Tags")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
    expect(screen.getByText("settling")).toBeTruthy();
  });

  it("seeds default tags when none exist", () => {
    tagsData = [];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(mockSeedMutate).toHaveBeenCalledOnce();
  });

  it("does not seed when tags already exist", () => {
    tagsData = [makeTag("settling")];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(mockSeedMutate).not.toHaveBeenCalled();
  });

  it("shows empty-state message when there are no entries", () => {
    entriesData = [];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByText("What you notice lives here.")).toBeTruthy();
  });

  it("hides empty-state message and renders entries when entries exist", () => {
    entriesData = [makeEntry(1)];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.queryByText("What you notice lives here.")).toBeNull();
    expect(screen.getByText("Situation 1")).toBeTruthy();
  });

  it("renders the filter button and Notice button when there is no draft", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByLabelText("Filter entries")).toBeTruthy();
    expect(screen.getByText("Notice")).toBeTruthy();
  });

  it("clicking Notice creates a new entry and opens the logger onSuccess", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Notice"));
    expect(mockCreateMutate).toHaveBeenCalledWith(
      { date: "2026-07-24" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(screen.getByText("tus-logger")).toBeInTheDocument();
  });

  it("renders the draft banner instead of Notice when a draft exists", () => {
    draftData = { ...makeEntry(5), status: "draft" };
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByText("You have an entry in progress.")).toBeTruthy();
    expect(screen.queryByText("Notice")).toBeNull();
  });

  it("clicking Continue opens the logger with the existing draft, calling no mutation", () => {
    draftData = { ...makeEntry(5), status: "draft" };
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Continue"));
    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(mockAbandonMutate).not.toHaveBeenCalled();
    expect(screen.getByText("tus-logger")).toBeInTheDocument();
  });

  it("clicking Discard abandons the draft and does not recreate one", () => {
    draftData = { ...makeEntry(5), status: "draft" };
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Discard"));
    expect(mockAbandonMutate).toHaveBeenCalledWith("tus-5");
    expect(mockCreateMutate).not.toHaveBeenCalled();
    expect(screen.queryByText("tus-logger")).toBeNull();
  });

  it("reverts to the normal state once the draft is discarded", () => {
    draftData = { ...makeEntry(5), status: "draft" };
    const { rerender } = render(
      <PanelTakeUpSpace userId="user-1" date="2026-07-24" />,
    );
    fireEvent.click(screen.getByText("Discard"));

    draftData = null;
    rerender(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);

    expect(screen.queryByText("You have an entry in progress.")).toBeNull();
    expect(screen.getByText("Notice")).toBeInTheDocument();
  });

  it("clicking the in-progress card in the entries log continues the draft", () => {
    const draftEntry: TakeUpSpaceEntry = { ...makeEntry(5), status: "draft" };
    draftData = draftEntry;
    entriesData = [draftEntry];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("In progress — tap to continue."));
    expect(screen.getByText("tus-logger")).toBeInTheDocument();
  });

  it("the in-progress card in the entries log does not continue the draft while discarding", () => {
    const draftEntry: TakeUpSpaceEntry = { ...makeEntry(5), status: "draft" };
    draftData = draftEntry;
    entriesData = [draftEntry];
    mockAbandonIsPending = true;
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("In progress — tap to continue."));
    expect(screen.queryByText("tus-logger")).toBeNull();
  });

  it("shows Discarding… on the Discard button while a mutation is pending", () => {
    draftData = { ...makeEntry(5), status: "draft" };
    mockAbandonIsPending = true;
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByText("Discarding…")).toBeInTheDocument();
  });

  it("closes the logger immediately when it completes, with no pause overlay", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Notice"));
    expect(screen.getByText("tus-logger")).toBeInTheDocument();

    fireEvent.click(screen.getByText("mock-log-complete"));
    expect(screen.queryByText("tus-logger")).toBeNull();
  });

  it("opens TakeUpSpaceCostEditor when Add to this is clicked on a completed entry", () => {
    entriesData = [{ ...makeEntry(1), cost: "My peace of mind." }];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Situation 1"));
    fireEvent.click(screen.getByText("Add to this"));
    expect(screen.getByText("cost-editor")).toBeInTheDocument();
  });

  it("closes TakeUpSpaceCostEditor when it calls onClose", () => {
    entriesData = [{ ...makeEntry(1), cost: "My peace of mind." }];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Situation 1"));
    fireEvent.click(screen.getByText("Add to this"));
    fireEvent.click(screen.getByText("mock-cost-close"));
    expect(screen.queryByText("cost-editor")).toBeNull();
  });

  it("opens TakeUpSpaceFilterSheet when the Filter button is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByLabelText("Filter entries"));
    expect(screen.getByText("filter-sheet")).toBeInTheDocument();
  });

  it("Filter icon is muted with no active filters, rose once a filter is set", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.getByLabelText("Filter entries")).toHaveClass("text-muted");

    fireEvent.click(screen.getByLabelText("Filter entries"));
    fireEvent.click(screen.getByText("mock-set-filter"));
    expect(screen.getByLabelText("Filter entries")).toHaveClass("text-rose");
  });

  it("passes the filtered entries list to the log, excluding entries that no longer match", () => {
    entriesData = [
      { ...makeEntry(1), choice_outcome: "override" },
      { ...makeEntry(2), choice_outcome: "paused" },
    ];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByLabelText("Filter entries"));
    fireEvent.click(screen.getByText("mock-set-filter"));
    expect(screen.getByText("Situation 1")).toBeInTheDocument();
    expect(screen.queryByText("Situation 2")).toBeNull();
  });

  it("shows a no-matches message when entries exist but none survive the filter", () => {
    entriesData = [{ ...makeEntry(1), choice_outcome: "paused" }];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByLabelText("Filter entries"));
    fireEvent.click(screen.getByText("mock-set-filter"));
    expect(
      screen.getByText("Nothing matches these filters."),
    ).toBeInTheDocument();
    expect(screen.queryByText("What you notice lives here.")).toBeNull();
  });

  it("does not show the no-matches message when there are no entries at all", () => {
    entriesData = [];
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    expect(screen.queryByText("Nothing matches these filters.")).toBeNull();
    expect(screen.getByText("What you notice lives here.")).toBeInTheDocument();
  });

  it("opens TakeUpSpaceTagEditor when Edit is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("tag-editor")).toBeInTheDocument();
  });

  it("opens TakeUpSpaceReferenceCard when info button is clicked", () => {
    render(<PanelTakeUpSpace userId="user-1" date="2026-07-24" />);
    fireEvent.click(screen.getByLabelText("About Take Up Space"));
    expect(screen.getByText("reference-card")).toBeInTheDocument();
  });
});
