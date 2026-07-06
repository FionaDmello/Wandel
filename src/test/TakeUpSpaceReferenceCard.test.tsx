import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TakeUpSpaceReferenceCard } from "@/features/engine/TakeUpSpaceReferenceCard";

vi.mock("@/components/ui/OverlayModal", () => ({
  OverlayModal: ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div>
      <button type="button" aria-label="Close" onClick={onClose}>
        ✕
      </button>
      {children}
    </div>
  ),
}));

describe("TakeUpSpaceReferenceCard", () => {
  it("renders the title", () => {
    render(<TakeUpSpaceReferenceCard onClose={vi.fn()} />);
    expect(screen.getByText("Take Up Space")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<TakeUpSpaceReferenceCard onClose={vi.fn()} />);
    expect(
      screen.getByText("Learning to stay with yourself"),
    ).toBeInTheDocument();
  });

  it("renders framing text", () => {
    render(<TakeUpSpaceReferenceCard onClose={vi.fn()} />);
    expect(screen.getByText(/Self-abandonment is quiet/)).toBeInTheDocument();
  });

  it("renders usage text", () => {
    render(<TakeUpSpaceReferenceCard onClose={vi.fn()} />);
    expect(screen.getByText(/Answer six questions/)).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<TakeUpSpaceReferenceCard onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
