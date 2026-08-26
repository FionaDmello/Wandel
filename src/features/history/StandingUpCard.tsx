import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

import { StandingUpTrackRow } from "@/features/history/StandingUpTrackRow";
import type { StandingUpTrack } from "@/types/standingUp";

interface StandingUpCardProps {
  tracks: StandingUpTrack[];
}

export function StandingUpCard({ tracks }: StandingUpCardProps) {
  const [open, setOpen] = useState(true);
  const visibleTracks = tracks.filter((t) => t.entries.length > 0);

  if (visibleTracks.length === 0) return null;

  return (
    <div className="mx-4 mt-2 mb-1 bg-card rounded-2xl px-5 py-4 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer"
      >
        <span className="font-sans text-[11px] text-amber uppercase tracking-wider">
          Standing Up
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-amber" />
        ) : (
          <ChevronRight className="w-4 h-4 text-amber" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-2">
          {visibleTracks.map((track, index) => (
            <Fragment key={track.id}>
              {index > 0 && <hr className="h-px bg-violet border-none" />}
              <StandingUpTrackRow
                trackName={track.trackName}
                entries={track.entries}
              />
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
