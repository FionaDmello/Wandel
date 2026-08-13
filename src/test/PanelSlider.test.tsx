import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PanelSlider } from "@/features/engine/PanelSlider";

describe("PanelSlider", () => {
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
        <PanelSlider
          value={5}
          onChange={vi.fn()}
          anchorLow="Calm"
          anchorHigh="Dreading it"
          accent="violet"
        />
      </div>,
    );

    const slider = screen.getByLabelText("Panel rating");
    fireEvent.touchStart(slider, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(slider, { touches: [{ clientY: 40 }] });
    fireEvent.touchEnd(slider);

    expect(onTouchStart).not.toHaveBeenCalled();
    expect(onTouchMove).not.toHaveBeenCalled();
    expect(onTouchEnd).not.toHaveBeenCalled();
  });

  it("still calls onChange when the slider's own value changes", () => {
    const onChange = vi.fn();
    render(
      <PanelSlider
        value={5}
        onChange={onChange}
        anchorLow="Calm"
        anchorHigh="Dreading it"
        accent="violet"
      />,
    );

    fireEvent.change(screen.getByLabelText("Panel rating"), {
      target: { value: "7" },
    });

    expect(onChange).toHaveBeenCalledWith(7);
  });
});
