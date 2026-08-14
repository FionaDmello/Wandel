import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "@/components/ui/DatePicker";

describe("DatePicker", () => {
  it("sets dialog role and aria-modal on the sheet", () => {
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("focuses the sheet on mount", () => {
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("returns focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={onClose} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Escape while an IME composition is in progress", () => {
    const onClose = vi.fn();
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={onClose} />,
    );
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("sets aria-label", () => {
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "Choose a date",
    );
  });

  it("wraps Tab from the last focusable element back to the first", () => {
    render(
      <DatePicker value="2026-05-27" onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    const cells = screen.getAllByRole("button");
    cells[cells.length - 1].focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(cells[0]).toHaveFocus();
  });
});
