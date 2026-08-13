import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

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
      <p className="font-sans text-[13px] text-muted text-center py-8">
        Nothing logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <div key={day.date} className="flex flex-col gap-2">
          <p className="font-sans text-[11px] font-medium text-muted uppercase tracking-[0.08em]">
            {format(parseISO(day.date), "EEEE, d MMMM")}
          </p>

          {day.observations.map((o) => (
            <JournalDaySection
              key={o.id}
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
            <JournalDaySection key={s.id} summary="Slipped">
              {s.cause_category && (
                <p className="font-sans text-[12px] text-muted">
                  {s.cause_category.replace(/_/g, " ")}
                </p>
              )}
              {s.emotional_state_before && (
                <p className="font-sans text-[12px] text-muted">
                  {s.emotional_state_before}
                </p>
              )}
              {s.all_or_nothing_stage && (
                <p className="font-sans text-[12px] text-muted">
                  {s.all_or_nothing_stage.replace(/_/g, " ")}
                </p>
              )}
            </JournalDaySection>
          ))}

          {day.standingUp && (
            <div className="bg-card rounded-2xl px-4 py-3">
              <p className="font-sans text-[13px] text-plum">
                Stood up — {formatGapLabel(day.standingUp.gap_days)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
