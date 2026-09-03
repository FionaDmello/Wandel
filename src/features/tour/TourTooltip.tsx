import type { TooltipRenderProps } from "react-joyride";

import { BUTTON_VARIANT_CLASSES } from "@/constants/buttonVariants";

interface TourStepData {
  primaryLabel?: string;
}

export function TourTooltip({
  step,
  index,
  size,
  isLastStep,
  backProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) {
  const primaryLabel =
    (step.data as TourStepData | undefined)?.primaryLabel ??
    (isLastStep ? "Let's begin" : "Next");

  return (
    <div
      {...tooltipProps}
      className="bg-canvas rounded-3xl px-6 py-6 max-w-[320px] flex flex-col gap-4 shadow-btn-primary"
    >
      {step.title && (
        <h2 className="font-serif italic text-[22px] text-plum leading-tight">
          {step.title}
        </h2>
      )}
      <p className="font-sans text-[13px] text-violet leading-snug">
        {step.content}
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-[11px] text-muted">
          {index + 1} / {size}
        </span>
        <div className="flex gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className={`w-auto px-4 ${BUTTON_VARIANT_CLASSES.ghost}`}
            >
              Back
            </button>
          )}
          {!isLastStep && (
            <button
              {...skipProps}
              className={`w-auto px-4 ${BUTTON_VARIANT_CLASSES.ghost}`}
            >
              Skip
            </button>
          )}
          <button
            {...primaryProps}
            className={`w-auto px-4 ${BUTTON_VARIANT_CLASSES.primary}`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
