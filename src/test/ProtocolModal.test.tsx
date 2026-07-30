import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProtocolModal } from "@/features/protocols/ProtocolModal";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ProtocolModal", () => {
  it("closes and unmounts on backdrop click even when no onClose prop is passed", () => {
    const { container } = render(
      <ProtocolModal>
        <p>content</p>
      </ProtocolModal>,
    );
    expect(screen.getByText("content")).toBeInTheDocument();

    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;
    fireEvent.click(backdrop);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("does nothing on backdrop click when dismissible is false", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProtocolModal onClose={onClose} dismissible={false}>
        <p>content</p>
      </ProtocolModal>,
    );

    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;
    fireEvent.click(backdrop);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on a swipe past the 80px threshold", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProtocolModal onClose={onClose}>
        <p>content</p>
      </ProtocolModal>,
    );
    const sheet = container.querySelector<HTMLDivElement>(
      ".transition-protocol-sheet",
    )!;

    fireEvent.touchStart(sheet, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(sheet, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(sheet);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("snaps back without closing on a swipe below the 80px threshold", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProtocolModal onClose={onClose}>
        <p>content</p>
      </ProtocolModal>,
    );
    const sheet = container.querySelector<HTMLDivElement>(
      ".transition-protocol-sheet",
    )!;

    fireEvent.touchStart(sheet, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(sheet, { touches: [{ clientY: 40 }] });
    fireEvent.touchEnd(sheet);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("snaps back on a swipe past threshold when dismissible is false", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProtocolModal onClose={onClose} dismissible={false}>
        <p>content</p>
      </ProtocolModal>,
    );
    const sheet = container.querySelector<HTMLDivElement>(
      ".transition-protocol-sheet",
    )!;

    fireEvent.touchStart(sheet, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(sheet, { touches: [{ clientY: 100 }] });
    fireEvent.touchEnd(sheet);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("calls onClose exactly once when two dismiss triggers overlap", () => {
    const onClose = vi.fn();
    const { container } = render(
      <ProtocolModal onClose={onClose}>
        <p>content</p>
      </ProtocolModal>,
    );
    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;

    fireEvent.click(backdrop);
    fireEvent.click(backdrop);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("stays closed after rerender once dismissed", () => {
    const onClose = vi.fn();
    const { container, rerender } = render(
      <ProtocolModal onClose={onClose}>
        <p>content</p>
      </ProtocolModal>,
    );
    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;
    fireEvent.click(backdrop);
    act(() => {
      vi.advanceTimersByTime(380);
    });

    rerender(
      <ProtocolModal onClose={onClose}>
        <p>different content</p>
      </ProtocolModal>,
    );

    expect(screen.queryByText("different content")).not.toBeInTheDocument();
  });
});
