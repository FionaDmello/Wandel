import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeUpSpaceEntryCard } from "@/features/engine/TakeUpSpaceEntryCard";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

const BASE_ENTRY: TakeUpSpaceEntry = {
  id: "e-1",
  user_id: "user-1",
  date: "2026-05-29",
  mode: "in_the_moment",
  situation: "I was about to say yes when I meant no.",
  action: "Going along with it.",
  cost: "My peace of mind.",
  need: "To say what I actually think.",
  choice_text: "I paused.",
  teaching: "The pause is the practice.",
  tag_ids: ["t-1"],
  tag_names: ["work"],
  choice_outcome: "paused",
  panel_tag: "self_worth",
  status: "complete",
  created_at: "2026-05-29T10:00:00Z",
  completed_at: "2026-05-29T10:15:00Z",
};

const DRAFT_ENTRY: TakeUpSpaceEntry = {
  ...BASE_ENTRY,
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
  completed_at: null,
};

describe("TakeUpSpaceEntryCard — in-progress", () => {
  it("renders situation text", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={DRAFT_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(
      screen.getByText("I was about to say yes when I meant no."),
    ).toBeInTheDocument();
  });

  it("renders the in-progress indicator", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={DRAFT_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
  });

  it("calls onContinue when tapped", () => {
    const onContinue = vi.fn();
    render(
      <TakeUpSpaceEntryCard
        entry={DRAFT_ENTRY}
        onContinue={onContinue}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onContinue).toHaveBeenCalledOnce();
  });
});

describe("TakeUpSpaceEntryCard — completed collapsed", () => {
  it("renders situation text", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(
      screen.getByText("I was about to say yes when I meant no."),
    ).toBeInTheDocument();
  });

  it("renders date and mode", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(screen.getByText(/29 May/)).toBeInTheDocument();
    expect(screen.getByText(/In the moment/)).toBeInTheDocument();
  });

  it("renders outcome dot when choice_outcome is set", () => {
    const { container } = render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='outcome-dot']"),
    ).toBeInTheDocument();
  });

  it("does not render outcome dot when choice_outcome is null", () => {
    const entry: TakeUpSpaceEntry = { ...BASE_ENTRY, choice_outcome: null };
    const { container } = render(
      <TakeUpSpaceEntryCard
        entry={entry}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(
      container.querySelector("[data-testid='outcome-dot']"),
    ).not.toBeInTheDocument();
  });
});

describe("TakeUpSpaceEntryCard — completed expanded", () => {
  it("expands to show field labels on tap", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    expect(screen.queryByText(/WHAT IS HAPPENING/)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );

    expect(screen.getByText(/WHAT IS HAPPENING/)).toBeInTheDocument();
  });

  it("hides null fields in expanded view", () => {
    const entry: TakeUpSpaceEntry = { ...BASE_ENTRY, teaching: null };
    render(
      <TakeUpSpaceEntryCard
        entry={entry}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(
      screen.queryByText(/WHAT THIS MOMENT IS TEACHING/),
    ).not.toBeInTheDocument();
  });

  it("hides teaching when it is empty string (Q6 skip sentinel)", () => {
    const entry: TakeUpSpaceEntry = { ...BASE_ENTRY, teaching: "" };
    render(
      <TakeUpSpaceEntryCard
        entry={entry}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(
      screen.queryByText(/WHAT THIS MOMENT IS TEACHING/),
    ).not.toBeInTheDocument();
  });

  it("fires onAddToCost without collapsing the card", () => {
    const onAddToCost = vi.fn();
    render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={onAddToCost}
      />,
    );

    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(screen.getByText(/WHAT IS HAPPENING/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Add to this"));
    expect(onAddToCost).toHaveBeenCalledOnce();
    expect(screen.getByText(/WHAT IS HAPPENING/)).toBeInTheDocument();
  });

  it("shows the PANEL row with the resolved label when panel_tag is set", () => {
    render(
      <TakeUpSpaceEntryCard
        entry={BASE_ENTRY}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(screen.getByText("PANEL")).toBeInTheDocument();
    expect(screen.getByText("Self-Worth")).toBeInTheDocument();
  });

  it("hides the PANEL row when panel_tag is null", () => {
    const entry: TakeUpSpaceEntry = { ...BASE_ENTRY, panel_tag: null };
    render(
      <TakeUpSpaceEntryCard
        entry={entry}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(screen.queryByText("PANEL")).not.toBeInTheDocument();
  });

  it("hides the PANEL row when panel_tag is 'none'", () => {
    const entry: TakeUpSpaceEntry = { ...BASE_ENTRY, panel_tag: "none" };
    render(
      <TakeUpSpaceEntryCard
        entry={entry}
        onContinue={vi.fn()}
        onAddToCost={vi.fn()}
      />,
    );
    fireEvent.click(
      screen.getByText("I was about to say yes when I meant no."),
    );
    expect(screen.queryByText("PANEL")).not.toBeInTheDocument();
  });
});
