import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { formatGapLabel } from "@/features/history/formatGapLabel";
import type { StandingUpEntry } from "@/types/database";

interface StandingUpTrackRowProps {
  trackName: string;
  entries: StandingUpEntry[];
}

function buildSummary(entries: StandingUpEntry[]): string {
  const count = entries.length;
  const fastest = Math.min(...entries.map((e) => e.gap_days));
  return `You stood up ${count} ${count === 1 ? "time" : "times"}. Fastest return: ${formatGapLabel(fastest).toLowerCase()}.`;
}

export function StandingUpTrackRow({
  trackName,
  entries,
}: StandingUpTrackRowProps) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer"
      >
        <span className="font-serif italic text-[16px] text-plum">
          {trackName}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-violet" />
        ) : (
          <ChevronRight className="w-4 h-4 text-violet" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber" />
                <span className="font-sans text-[11px] text-violet">
                  {formatGapLabel(entry.gap_days)}
                </span>
                <span className="font-sans text-[10px] text-violet">
                  {format(parseISO(entry.fall_date), "d MMM")} →{" "}
                  {format(parseISO(entry.return_date), "d MMM")}
                </span>
              </div>
            ))}
          </div>
          <p className="font-sans text-[12px] text-violet">
            {buildSummary(entries)}
          </p>
        </div>
      )}
    </div>
  );
}
