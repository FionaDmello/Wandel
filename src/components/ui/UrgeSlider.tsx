import { useEffect, useRef } from "react";

import { stopPropagation } from "@/lib/stopPropagation";

interface UrgeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function UrgeSlider({ value, onChange }: UrgeSliderProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const percentage = ((value - 1) / 9) * 100;
    ref.current?.style.setProperty("--urge-fill", `${percentage}%`);
  }, [value]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="font-sans text-[11px] text-muted">Low</span>
        <span className="font-serif text-[24px] font-semibold text-amber leading-none">
          {value}
        </span>
        <span className="font-sans text-[11px] text-muted">High</span>
      </div>
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
        className="urge-slider w-full"
        aria-label="Urge intensity"
      />
    </div>
  );
}
