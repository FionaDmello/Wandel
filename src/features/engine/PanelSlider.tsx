import { useEffect, useRef } from "react";

import type { AccentColor } from "@/constants/accentClasses";
import { ACCENT_SLIDER, ACCENT_TEXT } from "@/constants/accentClasses";

interface PanelSliderProps {
  value: number;
  onChange: (value: number) => void;
  anchorLow: string;
  anchorHigh: string;
  accent: AccentColor;
}

function stopPropagation(e: React.TouchEvent<HTMLInputElement>) {
  e.stopPropagation();
}

export function PanelSlider({
  value,
  onChange,
  anchorLow,
  anchorHigh,
  accent,
}: PanelSliderProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pct = ((value - 1) / 9) * 100;
    ref.current?.style.setProperty("--panel-fill", `${pct}%`);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onTouchStart={stopPropagation}
          onTouchMove={stopPropagation}
          onTouchEnd={stopPropagation}
          className={`panel-slider ${ACCENT_SLIDER[accent]} flex-1`}
          aria-label="Panel rating"
        />
        <span
          className={`font-serif text-[24px] font-semibold leading-none ${ACCENT_TEXT[accent]}`}
        >
          {value}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="font-sans text-[11px] text-muted">{anchorLow}</span>
        <span className="font-sans text-[11px] text-muted">{anchorHigh}</span>
      </div>
    </div>
  );
}
