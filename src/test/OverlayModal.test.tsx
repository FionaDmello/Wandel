import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverlayModal } from "@/components/ui/OverlayModal";

describe("OverlayModal", () => {
  it("sets dialog role and aria-modal on the panel", () => {
    render(
      <OverlayModal onClose={vi.fn()}>
        <p>content</p>
      </OverlayModal>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("focuses the panel on mount", () => {
    render(
      <OverlayModal onClose={vi.fn()}>
        <p>content</p>
      </OverlayModal>,
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("returns focus to the previously focused element on unmount", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(
      <OverlayModal onClose={vi.fn()}>
        <p>content</p>
      </OverlayModal>,
    );
    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <OverlayModal onClose={onClose}>
        <p>content</p>
      </OverlayModal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores Escape while an IME composition is in progress", () => {
    const onClose = vi.fn();
    render(
      <OverlayModal onClose={onClose}>
        <p>content</p>
      </OverlayModal>,
    );
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <OverlayModal onClose={onClose}>
        <p>content</p>
      </OverlayModal>,
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
