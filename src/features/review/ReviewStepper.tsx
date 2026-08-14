import { format, parseISO, subDays } from "date-fns";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { useSubmitWeeklyReview } from "@/hooks/useSubmitWeeklyReview";
import { useWeeklyConsistency } from "@/hooks/useWeeklyConsistency";
import type { Habit, StandingUpEntry } from "@/types/database";

const RATINGS = [1, 2, 3, 4, 5] as const;

interface ReviewStepperProps {
  userId: string;
  weekEnding: string;
  breakHabits: Habit[];
  buildHabits: Habit[];
  standingUpEntries: StandingUpEntry[];
  onComplete: () => void;
  onCancel: () => void;
}

type Phase = "engine" | "standing_up" | "habit" | "consistency" | "summary";

interface FormState {
  engineResponse: string;
  prideNote: string;
  habitResponses: Record<
    string,
    { whatDone: string; whatGotInWay: string; adjustment: string }
  >;
  selfRatedConsistency: number | null;
}

function weekStartDate(weekEnding: string): string {
  return format(subDays(parseISO(weekEnding), 6), "yyyy-MM-dd");
}

export function ReviewStepper({
  userId,
  weekEnding,
  breakHabits,
  buildHabits,
  standingUpEntries,
  onComplete,
  onCancel,
}: ReviewStepperProps) {
  const allHabits = [...breakHabits, ...buildHabits];
  const hasStandingUp = standingUpEntries.length > 0;

  const [phase, setPhase] = useState<Phase>("engine");
  const [habitIndex, setHabitIndex] = useState(0);
  const [consistencyRevealed, setConsistencyRevealed] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    engineResponse: "",
    prideNote: "",
    habitResponses: Object.fromEntries(
      allHabits.map((h) => [
        h.id,
        { whatDone: "", whatGotInWay: "", adjustment: "" },
      ]),
    ),
    selfRatedConsistency: null,
  });

  const consistencyQuery = useWeeklyConsistency(userId, weekEnding);
  const submit = useSubmitWeeklyReview(userId);

  const weekStart = weekStartDate(weekEnding);
  const weekEntries = standingUpEntries.filter(
    (e) => e.return_date >= weekStart && e.return_date <= weekEnding,
  );

  const goBack = () => {
    if (phase === "summary") {
      setPhase("consistency");
      return;
    }
    if (phase === "consistency") {
      if (allHabits.length > 0) {
        setPhase("habit");
        setHabitIndex(allHabits.length - 1);
      } else if (hasStandingUp) {
        setPhase("standing_up");
      } else {
        setPhase("engine");
      }
      return;
    }
    if (phase === "habit") {
      if (habitIndex > 0) {
        setHabitIndex((i) => i - 1);
      } else if (hasStandingUp) {
        setPhase("standing_up");
      } else {
        setPhase("engine");
      }
      return;
    }
    if (phase === "standing_up") {
      setPhase("engine");
    }
  };

  const goNextFromEngine = () => {
    setPhase(
      hasStandingUp
        ? "standing_up"
        : allHabits.length > 0
          ? "habit"
          : "consistency",
    );
  };

  const goNextFromStandingUp = () => {
    setPhase(allHabits.length > 0 ? "habit" : "consistency");
  };

  const goNextFromHabit = () => {
    if (habitIndex < allHabits.length - 1) {
      setHabitIndex((i) => i + 1);
    } else {
      setPhase("consistency");
    }
  };

  const setHabitField = (
    habitId: string,
    field: "whatDone" | "whatGotInWay" | "adjustment",
    value: string,
  ) =>
    setFormState((s) => ({
      ...s,
      habitResponses: {
        ...s.habitResponses,
        [habitId]: { ...s.habitResponses[habitId], [field]: value },
      },
    }));

  const handleSubmit = () => {
    if (formState.selfRatedConsistency === null) return;
    submit.mutate(
      {
        weekEnding,
        engineResponse: formState.engineResponse,
        prideNote: hasStandingUp ? formState.prideNote : null,
        selfRatedConsistency: formState.selfRatedConsistency,
        habitResponses: allHabits.map((h) => ({
          habitId: h.id,
          ...formState.habitResponses[h.id],
        })),
      },
      { onSuccess: onComplete },
    );
  };

  const TEXTAREA = `w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas resize-none placeholder:text-muted`;
  const CANCEL =
    "font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer";

  if (phase === "engine") {
    return (
      <div className="flex flex-col gap-6 px-6 pt-3 pb-8">
        <p className="font-serif text-[22px] leading-snug text-plum">
          How did the mirror practice feel this week?
        </p>
        <textarea
          rows={3}
          value={formState.engineResponse}
          onChange={(e) =>
            setFormState((s) => ({ ...s, engineResponse: e.target.value }))
          }
          placeholder="Write freely…"
          className={TEXTAREA}
        />
        <Button variant="primary" onClick={goNextFromEngine}>
          Continue
        </Button>
        <button type="button" onClick={onCancel} className={CANCEL}>
          Cancel
        </button>
      </div>
    );
  }

  if (phase === "standing_up") {
    return (
      <div className="flex flex-col gap-6 px-6 pt-3 pb-8">
        <p className="font-serif text-[22px] leading-snug text-plum">
          You stood back up this week.
        </p>
        <div className="flex flex-col gap-2">
          {weekEntries.map((entry) => (
            <div key={entry.id} className="flex flex-col">
              <p className="font-sans text-[13px] text-soft">
                {entry.track_name}
              </p>
              <p className="font-sans text-[12px] text-muted">
                {entry.gap_days === 0
                  ? "Same day"
                  : `${entry.gap_days} day${entry.gap_days === 1 ? "" : "s"} gap`}
              </p>
            </div>
          ))}
        </div>
        <p className="font-sans text-[12px] text-muted leading-relaxed">
          How do you feel about this?
        </p>
        <textarea
          rows={3}
          value={formState.prideNote}
          onChange={(e) =>
            setFormState((s) => ({ ...s, prideNote: e.target.value }))
          }
          placeholder="Write freely…"
          className={TEXTAREA}
        />
        <Button variant="primary" onClick={goNextFromStandingUp}>
          Continue
        </Button>
        <button type="button" onClick={goBack} className={CANCEL}>
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "habit") {
    const habit = allHabits[habitIndex];
    const habitResponse = formState.habitResponses[habit.id];
    return (
      <div className="flex flex-col gap-6 px-6 pt-3 pb-8">
        <div className="flex flex-col gap-1">
          <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
            {habitIndex + 1} / {allHabits.length} — {habit.name}
          </p>
          <p className="font-serif text-[22px] leading-snug text-plum">
            How did this habit go this week?
          </p>
        </div>
        <textarea
          rows={2}
          value={habitResponse.whatDone}
          onChange={(e) => setHabitField(habit.id, "whatDone", e.target.value)}
          placeholder="What did you do?"
          className={TEXTAREA}
        />
        <textarea
          rows={2}
          value={habitResponse.whatGotInWay}
          onChange={(e) =>
            setHabitField(habit.id, "whatGotInWay", e.target.value)
          }
          placeholder="What got in the way?"
          className={TEXTAREA}
        />
        <textarea
          rows={2}
          value={habitResponse.adjustment}
          onChange={(e) =>
            setHabitField(habit.id, "adjustment", e.target.value)
          }
          placeholder="Any adjustment for next week?"
          className={TEXTAREA}
        />
        <Button variant="primary" onClick={goNextFromHabit}>
          {habitIndex < allHabits.length - 1 ? "Next habit" : "Continue"}
        </Button>
        <button type="button" onClick={goBack} className={CANCEL}>
          ← Back
        </button>
      </div>
    );
  }

  if (phase === "consistency") {
    const consistencyData = consistencyQuery.data;
    return (
      <div className="flex flex-col gap-6 px-6 pt-3 pb-8">
        <p className="font-serif text-[22px] leading-snug text-plum">
          How consistent were you this week?
        </p>
        <p className="font-sans text-[12px] text-muted leading-relaxed">
          Rate yourself first, then see how you actually did.
        </p>
        <div className="flex gap-3">
          {RATINGS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() =>
                setFormState((s) => ({ ...s, selfRatedConsistency: r }))
              }
              className={[
                "w-10 h-10 rounded-full font-sans text-sm border",
                formState.selfRatedConsistency === r
                  ? "bg-plum text-canvas border-plum"
                  : "bg-card text-muted border-border",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>
        {!consistencyRevealed && (
          <Button
            variant="primary"
            onClick={() => setConsistencyRevealed(true)}
            disabled={formState.selfRatedConsistency === null}
          >
            See how I actually did →
          </Button>
        )}
        {consistencyRevealed && consistencyData && (
          <div className="flex flex-col gap-2">
            <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
              Actual
            </p>
            <p className="font-sans text-[13px] text-soft">
              Mirror — {consistencyData.engineMarked}/7 days
            </p>
            {buildHabits.map((h) => (
              <p key={h.id} className="font-sans text-[13px] text-soft">
                {h.name} — {consistencyData.buildObsDaysByHabit[h.id] ?? 0}/7
                days
              </p>
            ))}
            {breakHabits.map((h) => (
              <p key={h.id} className="font-sans text-[13px] text-soft">
                {h.name} —{" "}
                {7 - (consistencyData.breakObsDaysByHabit[h.id] ?? 0)}/7 clean
                days
              </p>
            ))}
          </div>
        )}
        {consistencyRevealed && (
          <Button variant="primary" onClick={() => setPhase("summary")}>
            Continue
          </Button>
        )}
        <button type="button" onClick={goBack} className={CANCEL}>
          ← Back
        </button>
      </div>
    );
  }

  // summary phase
  return (
    <div className="flex flex-col gap-6 px-6 pt-3 pb-8">
      <p className="font-serif text-[22px] leading-snug text-plum">
        Review summary
      </p>
      <div className="flex flex-col gap-5">
        {formState.engineResponse && (
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
              Mirror
            </p>
            <p className="font-sans text-[13px] text-soft leading-relaxed">
              {formState.engineResponse}
            </p>
          </div>
        )}
        {hasStandingUp && formState.prideNote && (
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
              Standing up
            </p>
            <p className="font-sans text-[13px] text-soft leading-relaxed">
              {formState.prideNote}
            </p>
          </div>
        )}
        {allHabits.map((h) => {
          const r = formState.habitResponses[h.id];
          if (!r.whatDone && !r.whatGotInWay && !r.adjustment) return null;
          return (
            <div key={h.id} className="flex flex-col gap-1">
              <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
                {h.name}
              </p>
              {r.whatDone && (
                <p className="font-sans text-[13px] text-soft leading-relaxed">
                  {r.whatDone}
                </p>
              )}
            </div>
          );
        })}
        {formState.selfRatedConsistency !== null && (
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
              Consistency
            </p>
            <p className="font-sans text-[13px] text-soft">
              {formState.selfRatedConsistency}/5
            </p>
          </div>
        )}
      </div>
      <Button
        variant="accent"
        onClick={handleSubmit}
        disabled={submit.isPending}
      >
        {submit.isPending ? "Saving…" : "Submit review"}
      </Button>
      <button type="button" onClick={goBack} className={CANCEL}>
        ← Back
      </button>
    </div>
  );
}
