import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TakeUpSpaceLogger } from "@/features/engine/TakeUpSpaceLogger";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

vi.mock("@/features/protocols/ProtocolModal", () => ({
  ProtocolModal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

let mockMutate = vi.fn();
let mockIsPending = false;

vi.mock("@/hooks/useTakeUpSpace", () => ({
  useUpdateTakeUpSpaceEntry: () => ({
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
    date: "2026-07-24",
    mode: "in_the_moment",
    situation: null,
    action: null,
    cost: null,
    need: null,
    choice_text: null,
    teaching: null,
    tag_ids: [],
    tag_names: [],
    choice_outcome: null,
    panel_tag: null,
    status: "draft",
    created_at: "2026-07-24T00:00:00Z",
    completed_at: null,
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

describe("TakeUpSpaceLogger", () => {
  it("renders step 0 (situation) first with progress 1 of 6 for a brand new entry", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("1 of 6")).toBeInTheDocument();
    expect(
      screen.getByText("What is happening right now?"),
    ).toBeInTheDocument();
  });

  it("resumes on step 2 of 6 (action) when situation is already filled", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({ situation: "Saying yes when I meant no" })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
  });

  it("shows the saved value if the user goes Back from a resumed step", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({ situation: "Saying yes when I meant no" })}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByRole("textbox")).toHaveValue(
      "Saying yes when I meant no",
    );
  });

  it("resumes on the end-of-flow placeholder when every field is answered", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({
          situation: "s",
          action: "a",
          cost: "c",
          need: "n",
          choice_text: "ct",
          teaching: "",
        })}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Categorisation coming in Session G."),
    ).toBeInTheDocument();
  });

  it("initializes the mode toggle from entry.mode and applies it to the action question", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({ mode: "looking_back" })}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Something happened" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("What did I do — or start to do?"),
    ).toBeInTheDocument();
  });

  it("Next is disabled when the textarea is empty or whitespace-only", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "   " },
    });
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Something" },
    });
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("clicking Next saves the trimmed value and mode, advancing only onSuccess", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Feeling small  " },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(mockMutate).toHaveBeenCalledWith(
      { id: "entry-1", mode: "in_the_moment", situation: "Feeling small" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(screen.getByText("2 of 6")).toBeInTheDocument();
  });

  it("does not advance the step when the mutation never calls onSuccess", () => {
    mockMutate = vi.fn();
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Feeling small" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("1 of 6")).toBeInTheDocument();
  });

  it("clicking Skip (step 5) saves the empty-string sentinel and mode", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({
          situation: "s",
          action: "a",
          cost: "c",
          need: "n",
          choice_text: "ct",
        })}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("6 of 6")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Skip"));
    expect(mockMutate).toHaveBeenCalledWith(
      { id: "entry-1", teaching: "", mode: "in_the_moment" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(
      screen.getByText("Categorisation coming in Session G."),
    ).toBeInTheDocument();
  });

  it("toggling mode changes what the next Next call saves", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Looking back"));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Feeling small" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(mockMutate).toHaveBeenCalledWith(
      { id: "entry-1", mode: "looking_back", situation: "Feeling small" },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("Back does not call the mutation", () => {
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({ situation: "Saying yes when I meant no" })}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Back"));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls onClose from the end-of-flow placeholder Close button", () => {
    const onClose = vi.fn();
    render(
      <TakeUpSpaceLogger
        userId="user-1"
        entry={makeEntry({
          situation: "s",
          action: "a",
          cost: "c",
          need: "n",
          choice_text: "ct",
          teaching: "",
        })}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
