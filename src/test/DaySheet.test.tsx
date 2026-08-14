import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DaySheet } from "@/features/history/DaySheet";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

const DEFAULT_PROPS = {
  date: "2026-05-27",
  hasEngineActivity: false,
  breakObs: [],
  buildObs: [],
  breakHabits: [],
  buildHabits: [],
  isFuture: false,
  onClose: vi.fn(),
};

describe("DaySheet", () => {
  it("sets dialog role and aria-modal on the sheet", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("focuses the sheet on mount", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("returns focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<DaySheet {...DEFAULT_PROPS} />);
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Escape while an IME composition is in progress", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<DaySheet {...DEFAULT_PROPS} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sets aria-label from the display date", () => {
    render(<DaySheet {...DEFAULT_PROPS} date="2026-05-27" />);
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Wednesday, 27 May",
    );
  });

  it("wraps Shift+Tab from the first focusable element back to the last", () => {
    render(<DaySheet {...DEFAULT_PROPS} />);
    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();
  });
});
