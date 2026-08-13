import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

import {
  ALL_OR_NOTHING_STAGE_LABELS,
  CAUSE_CATEGORY_LABELS,
} from "@/constants/slipLabels";
import { formatGapLabel } from "@/features/history/formatGapLabel";
import { JournalDaySection } from "@/features/journal/JournalDaySection";
import { mergeJournalEntries } from "@/features/journal/mergeJournalEntries";
import { useBuildHabitObservations } from "@/hooks/useBuildHabitObservations";
import { useBuildSlipEvents } from "@/hooks/useBuildSlipEvents";
import { useStandingUpEntries } from "@/hooks/useStandingUpLog";
import type { BuildObservation } from "@/types/database";

interface DatedSlip {
  id: string;
  date: string;
  cause_category: "distress_tolerance" | "logistics" | "emotional_load" | null;
  emotional_state_before: string | null;
  all_or_nothing_stage: string | null;
}

interface BuildJournalProps {
  userId: string;
  habitId: string;
}

export function BuildJournal({ userId, habitId }: BuildJournalProps) {
  const navigate = useNavigate();
  const observationsQuery = useBuildHabitObservations(userId, habitId);
  const slipsQuery = useBuildSlipEvents(userId);
  const standingUpQuery = useStandingUpEntries(userId, "build", habitId);

  if (
    observationsQuery.isLoading ||
    slipsQuery.isLoading ||
    standingUpQuery.isLoading
  ) {
    return null;
  }

  const observations = observationsQuery.data ?? [];
  const slips: DatedSlip[] = (slipsQuery.data ?? [])
    .filter((s) => s.habit_id === habitId)
    .map((s) => ({
      id: s.id,
      date: s.triggered_at.slice(0, 10),
      cause_category: s.cause_category,
      emotional_state_before: s.emotional_state_before,
      all_or_nothing_stage: s.all_or_nothing_stage,
    }));

  const days = mergeJournalEntries<BuildObservation, DatedSlip>(
    observations,
    slips,
    standingUpQuery.data ?? [],
  );

  if (days.length === 0) {
    return (
      <p className="font-serif italic text-[15px] text-muted text-center py-10">
        Nothing logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div
          key={day.date}
          className="flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-amber px-5 py-4"
        >
          <p className="font-serif text-[16px] font-semibold leading-snug text-plum">
            {format(parseISO(day.date), "EEEE, d MMMM")}
          </p>

          {day.standingUp && (
            <JournalDaySection
              dotClassName="bg-teal"
              summary={`Stood up · ${formatGapLabel(day.standingUp.gap_days)}`}
            >
              <p className="font-sans text-[12px] text-muted">
                {format(parseISO(day.standingUp.fall_date), "d MMM")} →{" "}
                {format(parseISO(day.standingUp.return_date), "d MMM")}
              </p>
            </JournalDaySection>
          )}

          {day.observations.map((o) => (
            <JournalDaySection
              key={o.id}
              dotClassName="bg-amber"
              summary={`${o.sub_type ? `${o.sub_type} · ` : ""}${o.mark_label}`}
            >
              {o.note && (
                <p className="font-sans text-[12px] text-muted">{o.note}</p>
              )}
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/build/$habitId/log",
                    params: { habitId },
                    search: {
                      date: day.date,
                      subType: o.sub_type ?? undefined,
                    },
                  })
                }
                className="font-sans text-[11px] font-medium text-amber text-left bg-transparent border-none cursor-pointer pt-1"
              >
                Edit
              </button>
            </JournalDaySection>
          ))}

          {day.slips.map((s) => (
            <JournalDaySection
              key={s.id}
              dotClassName="bg-muted"
              summary="Slipped"
            >
              {s.cause_category && (
                <p className="font-sans text-[12px] text-muted">
                  <span className="text-plum font-medium">
                    What was unavailable:{" "}
                  </span>
                  <span>{CAUSE_CATEGORY_LABELS[s.cause_category]}</span>
                </p>
              )}
              {s.emotional_state_before && (
                <p className="font-sans text-[12px] text-muted">
                  <span className="text-plum font-medium">
                    Feeling before:{" "}
                  </span>
                  <span>{s.emotional_state_before}</span>
                </p>
              )}
              {s.all_or_nothing_stage && (
                <p className="font-sans text-[12px] text-muted">
                  <span className="text-plum font-medium">
                    Where you were:{" "}
                  </span>
                  <span>
                    {ALL_OR_NOTHING_STAGE_LABELS[s.all_or_nothing_stage] ??
                      s.all_or_nothing_stage}
                  </span>
                </p>
              )}
            </JournalDaySection>
          ))}
        </div>
      ))}
    </div>
  );
}
