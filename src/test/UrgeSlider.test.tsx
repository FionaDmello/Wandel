import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UrgeSlider } from "@/components/ui/UrgeSlider";

describe("UrgeSlider", () => {
  it("does not let touch events bubble to an ancestor's touch handlers", () => {
    const onTouchStart = vi.fn();
    const onTouchMove = vi.fn();
    const onTouchEnd = vi.fn();

    render(
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <UrgeSlider value={5} onChange={vi.fn()} />
      </div>,
    );

    const slider = screen.getByLabelText("Urge intensity");
    fireEvent.touchStart(slider, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(slider, { touches: [{ clientY: 40 }] });
    fireEvent.touchEnd(slider);

    expect(onTouchStart).not.toHaveBeenCalled();
    expect(onTouchMove).not.toHaveBeenCalled();
    expect(onTouchEnd).not.toHaveBeenCalled();
  });

  it("still calls onChange when the slider's own value changes", () => {
    const onChange = vi.fn();
    render(<UrgeSlider value={5} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Urge intensity"), {
      target: { value: "7" },
    });

    expect(onChange).toHaveBeenCalledWith(7);
  });
});
