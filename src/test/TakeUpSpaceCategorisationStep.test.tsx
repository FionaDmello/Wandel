import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TakeUpSpaceCategorisationStep } from "@/features/engine/TakeUpSpaceCategorisationStep";
import type { TakeUpSpaceEntry, TakeUpSpaceTag } from "@/types/takeUpSpace";

let mockMutate = vi.fn();
let mockIsPending = false;
let tagsData: TakeUpSpaceTag[] = [];

vi.mock("@/hooks/useTakeUpSpace", () => ({
  useCompleteEntry: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

vi.mock("@/hooks/useTakeUpSpaceTags", () => ({
  useTakeUpSpaceTags: () => ({ data: tagsData }),
}));

function makeEntry(
  overrides: Partial<TakeUpSpaceEntry> = {},
): TakeUpSpaceEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    date: "2026-07-24",
    mode: "in_the_moment",
    situation: "s",
    action: "a",
    cost: "c",
    need: "n",
    choice_text: "ct",
    teaching: "",
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

beforeEach(() => {
  mockMutate = vi.fn(
    (_payload: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.();
    },
  );
  mockIsPending = false;
  tagsData = [];
});

describe("TakeUpSpaceCategorisationStep", () => {
  it("renders outcome, panel-tag, and tag chip groups", () => {
    tagsData = [makeTag()];
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry()}
        mode="in_the_moment"
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("I overrode myself")).toBeInTheDocument();
    expect(screen.getByText("Self-Respect")).toBeInTheDocument();
    expect(screen.getByText("settling")).toBeInTheDocument();
  });

  it("Done is disabled with no outcome selected, enabled once one is tapped", () => {
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry()}
        mode="in_the_moment"
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Done")).toBeDisabled();
    fireEvent.click(screen.getByText("I paused"));
    expect(screen.getByText("Done")).not.toBeDisabled();
  });

  it("tapping the selected outcome chip again clears it and re-disables Done", () => {
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry()}
        mode="in_the_moment"
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("I paused"));
    expect(screen.getByText("Done")).not.toBeDisabled();
    fireEvent.click(screen.getByText("I paused"));
    expect(screen.getByText("Done")).toBeDisabled();
  });

  it("tag chips toggle multi-select membership independently of outcome", () => {
    tagsData = [
      makeTag({ id: "t-1", name: "settling" }),
      makeTag({ id: "t-2", name: "work" }),
    ];
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry()}
        mode="in_the_moment"
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("settling"));
    fireEvent.click(screen.getByText("work"));
    expect(screen.getByText("settling")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("work")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByText("settling"));
    expect(screen.getByText("settling")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("resumes with previously-saved selections", () => {
    tagsData = [makeTag({ id: "t-1", name: "settling" })];
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry({
          choice_outcome: "chose_differently",
          panel_tag: "self_love",
          tag_ids: ["t-1"],
        })}
        mode="in_the_moment"
        onBack={vi.fn()}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("I chose differently")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Self-Love")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("settling")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("Done saves choice_outcome, mode, panel_tag, and tag_ids/tag_names derived from the same selected-tags list", () => {
    tagsData = [
      makeTag({ id: "t-1", name: "settling" }),
      makeTag({ id: "t-2", name: "work" }),
    ];
    const onComplete = vi.fn();
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry({ tag_ids: ["t-1", "stale-id"] })}
        mode="looking_back"
        onBack={vi.fn()}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByText("I overrode myself"));
    fireEvent.click(screen.getByText("Self-Worth"));
    fireEvent.click(screen.getByText("work"));
    fireEvent.click(screen.getByText("Done"));

    expect(mockMutate).toHaveBeenCalledWith(
      {
        id: "entry-1",
        mode: "looking_back",
        choice_outcome: "override",
        panel_tag: "self_worth",
        tag_ids: ["t-1", "t-2"],
        tag_names: ["settling", "work"],
      },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("Back calls onBack without calling mutate", () => {
    const onBack = vi.fn();
    render(
      <TakeUpSpaceCategorisationStep
        userId="user-1"
        entry={makeEntry()}
        mode="in_the_moment"
        onBack={onBack}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Back"));
    expect(onBack).toHaveBeenCalledOnce();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
