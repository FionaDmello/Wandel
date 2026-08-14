import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ConsistencyDots } from "@/components/ui/ConsistencyDots";
import type { Habit, WeeklyReviewWithHabits } from "@/types/database";
import type { WeeklyConsistencyData } from "@/types/review";

interface ReviewHistoryRecordProps {
  review: WeeklyReviewWithHabits;
  habits: Habit[];
  isExpanded: boolean;
  consistencyData: WeeklyConsistencyData | undefined;
  onToggle: () => void;
}

export function ReviewHistoryRecord({
  review,
  habits,
  isExpanded,
  consistencyData,
  onToggle,
}: ReviewHistoryRecordProps) {
  const habitById = Object.fromEntries(habits.map((h) => [h.id, h]));
  const breakHabits = habits.filter((h) => h.category === "break");
  const buildHabits = habits.filter((h) => h.category === "build");

  return (
    <div className="bg-card rounded-2xl px-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex items-start justify-between py-4 w-full gap-4"
      >
        <div className="flex flex-col items-start gap-2">
          <p className="font-serif italic text-[18px] text-plum leading-snug">
            {format(parseISO(review.week_ending), "d MMM yyyy")}
          </p>
          {review.self_rated_consistency !== null && (
            <ConsistencyDots rating={review.self_rated_consistency} />
          )}
          {review.engine_response && (
            <p className="font-sans text-[12px] text-muted line-clamp-2 text-left">
              {review.engine_response}
            </p>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-muted shrink-0 mt-1" />
        ) : (
          <ChevronDown size={16} className="text-muted shrink-0 mt-1" />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-7 pb-6 border-t border-border pt-5">
          {review.engine_response && (
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[11px] text-violet tracking-wider">
                Mirror
              </p>
              <p className="font-serif text-[17px] text-plum leading-relaxed">
                {review.engine_response}
              </p>
            </div>
          )}

          {review.pride_note && (
            <div className="flex flex-col gap-1">
              <p className="font-sans text-[11px] text-violet tracking-wider">
                Standing up
              </p>
              <p className="font-serif text-[17px] text-plum leading-relaxed">
                {review.pride_note}
              </p>
            </div>
          )}

          {review.habit_reviews.map((hr) => {
            const habit = habitById[hr.habit_id];
            if (!habit) return null;
            return (
              <div key={hr.id} className="flex flex-col gap-1">
                <p className="font-sans text-[11px] text-violet tracking-wider">
                  {habit.name}
                </p>
                {hr.what_done && (
                  <p className="font-serif text-[17px] text-plum leading-relaxed">
                    {hr.what_done}
                  </p>
                )}
              </div>
            );
          })}

          {review.self_rated_consistency !== null && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-[11px] text-violet tracking-wider">
                Consistency
              </p>
              <div className="flex items-center gap-3">
                <ConsistencyDots rating={review.self_rated_consistency} />
                <p className="font-sans text-xs text-muted">
                  {review.self_rated_consistency}/5 self-rated
                </p>
              </div>
              {consistencyData && (
                <div className="flex flex-col gap-1 mt-1">
                  <p className="font-sans text-[13px] text-plum">
                    Mirror — {consistencyData.engineMarked}/7 days
                  </p>
                  {buildHabits.map((h) => (
                    <p key={h.id} className="font-sans text-[13px] text-plum">
                      {h.name} —{" "}
                      {consistencyData.buildObsDaysByHabit[h.id] ?? 0}/7 days
                    </p>
                  ))}
                  {breakHabits.map((h) => (
                    <p key={h.id} className="font-sans text-[13px] text-plum">
                      {h.name} —{" "}
                      {7 - (consistencyData.breakObsDaysByHabit[h.id] ?? 0)}/7
                      clean days
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
