import { format, parseISO } from "date-fns";
import { useState } from "react";

import { MODE_LABELS } from "@/constants/takeUpSpaceModeLabels";
import { OUTCOME_COLORS } from "@/constants/takeUpSpaceOutcomeColors";
import { PANEL_TAG_OPTIONS } from "@/constants/takeUpSpacePanelOptions";
import type { TakeUpSpaceEntry, TakeUpSpaceOutcome } from "@/types/takeUpSpace";

interface TakeUpSpaceEntryCardProps {
  entry: TakeUpSpaceEntry;
  onContinue: () => void;
  onAddToCost: () => void;
}

type FieldKey =
  | "situation"
  | "action"
  | "cost"
  | "need"
  | "choice_text"
  | "teaching";

const FIELD_ORDER: FieldKey[] = [
  "situation",
  "action",
  "cost",
  "need",
  "choice_text",
  "teaching",
];

const FIELD_LABELS: Record<FieldKey, string> = {
  situation: "WHAT IS HAPPENING",
  action: "WHAT I WAS PULLED TOWARD / WHAT I DID",
  cost: "WHAT THIS IS COSTING ME",
  need: "WHAT I ACTUALLY NEED",
  choice_text: "WHAT I CHOOSE",
  teaching: "WHAT THIS MOMENT IS TEACHING ME",
};

export function TakeUpSpaceEntryCard({
  entry,
  onContinue,
  onAddToCost,
}: TakeUpSpaceEntryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const date = format(parseISO(entry.date), "d MMM");
  const modeLabel = MODE_LABELS[entry.mode];

  if (entry.status === "draft") {
    return (
      <button
        type="button"
        onClick={onContinue}
        className="w-full text-left bg-canvas rounded-2xl px-4 py-3 border-l-[3px] border-l-rose/50 flex flex-col gap-1"
      >
        <span className="font-sans text-[12px] font-medium text-plum truncate">
          {entry.situation ?? "—"}
        </span>
        <span className="font-serif italic text-[12px] text-violet">
          In progress — tap to continue.
        </span>
      </button>
    );
  }

  const dotColor =
    entry.choice_outcome !== null
      ? OUTCOME_COLORS[entry.choice_outcome as TakeUpSpaceOutcome]
      : null;

  const answeredFields = FIELD_ORDER.filter((key) => {
    const val = entry[key];
    return val !== null && val !== "";
  });

  return (
    <div
      onClick={() => setIsOpen((o) => !o)}
      className="bg-canvas rounded-2xl px-4 py-3 cursor-pointer flex flex-col gap-1.5"
    >
      <span className="font-sans text-[12px] font-medium text-plum truncate">
        {entry.situation ?? "—"}
      </span>

      <div className="flex items-center gap-1.5">
        {dotColor !== null && (
          <span
            data-testid="outcome-dot"
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
          />
        )}
        <span className="font-sans text-[10px] text-muted">
          {date} · {modeLabel}
        </span>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-3 pt-2 mt-1 border-t border-border">
          {answeredFields.map((key) => {
            const val = entry[key] as string;
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="font-sans text-[9px] font-medium text-rose-dark uppercase tracking-widest">
                  {FIELD_LABELS[key]}
                </span>
                <p className="font-sans text-[13px] text-plum whitespace-pre-wrap">
                  {val}
                </p>
                {key === "cost" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCost();
                    }}
                    className="font-sans text-[9px] text-muted text-left"
                  >
                    Add to this
                  </button>
                )}
              </div>
            );
          })}

          {entry.tag_names.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[9px] font-medium text-rose-dark uppercase tracking-widest">
                TAGS
              </span>
              <p className="font-sans text-[13px] text-plum">
                {entry.tag_names.join(" · ")}
              </p>
            </div>
          )}

          {entry.panel_tag !== null && entry.panel_tag !== "none" && (
            <div className="flex flex-col gap-1">
              <span className="font-sans text-[9px] font-medium text-rose-dark uppercase tracking-widest">
                PANEL
              </span>
              <p className="font-sans text-[13px] text-plum">
                {
                  PANEL_TAG_OPTIONS.find((o) => o.value === entry.panel_tag)
                    ?.label
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
