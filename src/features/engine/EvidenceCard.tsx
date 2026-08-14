import { format, parseISO } from "date-fns";

import type { Evidence } from "@/types/engine";

interface EvidenceCardProps {
  entry: Evidence;
  isOpen: boolean;
  onToggle: () => void;
}

export function EvidenceCard({ entry, isOpen, onToggle }: EvidenceCardProps) {
  const { title, situation, what_i_did_well, date } = entry;
  const formattedDate = format(parseISO(date), "d MMM yyyy");

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="w-full text-left bg-canvas rounded-2xl px-4 py-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-serif text-[15px] font-semibold leading-snug text-plum">
          {title}
        </span>
        <span className="font-sans text-[11px] text-muted shrink-0">
          {formattedDate}
        </span>
      </div>

      {!isOpen && (
        <p className="font-sans text-[12px] text-muted line-clamp-2">
          {what_i_did_well}
        </p>
      )}

      {isOpen && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
              Situation
            </span>
            <p className="font-sans text-[13px] text-plum whitespace-pre-wrap">
              {situation}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
              What I did well
            </span>
            <p className="font-sans text-[13px] text-plum whitespace-pre-wrap">
              {what_i_did_well}
            </p>
          </div>
        </div>
      )}
    </button>
  );
}
