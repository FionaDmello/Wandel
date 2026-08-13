import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

import {
  ALL_OR_NOTHING_STAGE_LABELS,
  CAUSE_CATEGORY_LABELS,
} from "@/constants/slipLabels";
import { formatGapLabel } from "@/features/history/formatGapLabel";
import { JournalDaySection } from "@/features/journal/JournalDaySection";
import { mergeJournalEntries } from "@/features/journal/mergeJournalEntries";
import { useBreakHabitObservations } from "@/hooks/useBreakHabitObservations";
import { useBreakSlipEvents } from "@/hooks/useBreakSlipEvents";
import { useStandingUpEntries } from "@/hooks/useStandingUpLog";
import type {
  BreakObservationWithEmotions,
  HabitConfig,
} from "@/types/database";

interface DatedObservation extends BreakObservationWithEmotions {
  date: string;
}

interface DatedSlip {
  id: string;
  date: string;
  jobLabel: string | null;
  cause_category: "distress_tolerance" | "logistics" | "emotional_load" | null;
  emotional_state_before: string | null;
  all_or_nothing_stage: string | null;
}

interface BreakJournalProps {
  userId: string;
  habitId: string;
  configs: HabitConfig[];
}

export function BreakJournal({ userId, habitId, configs }: BreakJournalProps) {
  const navigate = useNavigate();
  const observationsQuery = useBreakHabitObservations(userId, habitId);
  const slipsQuery = useBreakSlipEvents(userId);
  const standingUpQuery = useStandingUpEntries(userId, "break", habitId);

  if (
    observationsQuery.isLoading ||
    slipsQuery.isLoading ||
    standingUpQuery.isLoading
  ) {
    return null;
  }

  const observations: DatedObservation[] = (observationsQuery.data ?? []).map(
    (o) => ({ ...o, date: o.logged_at.slice(0, 10) }),
  );
  const slips: DatedSlip[] = (slipsQuery.data ?? [])
    .filter((s) => s.habit_id === habitId)
    .map((s) => ({
      id: s.id,
      date: s.triggered_at.slice(0, 10),
      jobLabel: configs.find((c) => c.id === s.job_id)?.value ?? null,
      cause_category: s.cause_category,
      emotional_state_before: s.emotional_state_before,
      all_or_nothing_stage: s.all_or_nothing_stage,
    }));

  const days = mergeJournalEntries<DatedObservation, DatedSlip>(
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
          className="flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-teal px-5 py-4"
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
              dotClassName="bg-teal"
              summary={o.job ?? "Urge logged"}
            >
              {o.context && (
                <p className="font-sans text-[12px] text-muted">{o.context}</p>
              )}
              {o.urge_intensity !== null && (
                <p className="font-sans text-[12px] text-muted">
                  Urge: {o.urge_intensity}/10
                </p>
              )}
              {o.emotions.length > 0 && (
                <p className="font-sans text-[12px] text-muted">
                  {o.emotions.map((e) => e.value).join(", ")}
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/break/$habitId/log",
                    params: { habitId },
                    search: { date: day.date, entryId: o.id },
                  })
                }
                className="font-sans text-[11px] font-medium text-teal text-left bg-transparent border-none cursor-pointer pt-1"
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
              {s.jobLabel && (
                <p className="font-sans text-[12px] text-muted">
                  <span className="text-plum font-medium">Job: </span>
                  <span>{s.jobLabel}</span>
                </p>
              )}
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
