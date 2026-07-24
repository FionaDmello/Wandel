import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeUpSpaceLogger } from "@/features/engine/TakeUpSpaceLogger";

vi.mock("@/features/protocols/ProtocolModal", () => ({
  ProtocolModal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("TakeUpSpaceLogger", () => {
  it("renders step 0 (situation) first with progress 1 of 6", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    expect(screen.getByText("1 of 6")).toBeInTheDocument();
    expect(
      screen.getByText("What is happening right now?"),
    ).toBeInTheDocument();
  });

  it("hides Back on step 0", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("shows Back from step 1 onward", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("only shows Skip on step 5 (teaching)", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    expect(screen.queryByText("Skip")).not.toBeInTheDocument();
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    expect(screen.getByText("6 of 6")).toBeInTheDocument();
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });

  it("advances through all 6 steps to the end-of-flow placeholder", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    expect(
      screen.getByText("Categorisation coming in Session G."),
    ).toBeInTheDocument();
  });

  it("persists a typed answer across Back then Next navigation", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Feeling small" },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Back"));
    expect(screen.getByRole("textbox")).toHaveValue("Feeling small");
  });

  it("defaults to in_the_moment wording for the action question", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("What am I being pulled toward?"),
    ).toBeInTheDocument();
  });

  it("switches to looking_back wording when mode toggle is clicked", () => {
    render(<TakeUpSpaceLogger onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("Looking back"));
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("What did I do — or start to do?"),
    ).toBeInTheDocument();
  });

  it("calls onClose from the end-of-flow placeholder Close button", () => {
    const onClose = vi.fn();
    render(<TakeUpSpaceLogger onClose={onClose} />);
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByText("Next"));
    }
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
