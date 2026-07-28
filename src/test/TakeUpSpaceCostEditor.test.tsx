import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TakeUpSpaceCostEditor } from "@/features/engine/TakeUpSpaceCostEditor";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

vi.mock("@/features/protocols/ProtocolModal", () => ({
  ProtocolModal: ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div>
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  ),
}));

let mockMutate = vi.fn();
let mockIsPending = false;

vi.mock("@/hooks/useTakeUpSpace", () => ({
  useUpdateCostField: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

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
    cost: "My peace of mind.",
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

beforeEach(() => {
  mockMutate = vi.fn(
    (_payload: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    },
  );
  mockIsPending = false;
});

describe("TakeUpSpaceCostEditor", () => {
  it("pre-fills the textarea with the entry's current cost", () => {
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry({ cost: "My peace of mind." })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("My peace of mind.");
  });

  it("shows the cost question and framing text", () => {
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByText("What is this costing me — or what did it cost me?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Not whether you are being too much. What is the actual cost — even if you can only partly name it right now.",
      ),
    ).toBeInTheDocument();
  });

  it("Save is disabled when the textarea is cleared to empty/whitespace", () => {
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "   " },
    });
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("Save trims and saves the value, closing only onSuccess", () => {
    const onClose = vi.fn();
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry({ id: "entry-9" })}
        onClose={onClose}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  My peace of mind. And my time.  " },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(mockMutate).toHaveBeenCalledWith(
      { id: "entry-9", cost: "My peace of mind. And my time." },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when the mutation never calls onSuccess", () => {
    mockMutate = vi.fn();
    const onClose = vi.fn();
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("Save"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("dismissing without saving does not call the mutation", () => {
    const onClose = vi.fn();
    render(
      <TakeUpSpaceCostEditor
        userId="user-1"
        entry={makeEntry()}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("close"));
    expect(mockMutate).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
