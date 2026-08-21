import { useNavigate } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { IconButton } from "@/components/ui/IconButton";
import { isHabitVisibleForDay } from "@/features/history/isHabitVisibleForDay";
import { trapFocus } from "@/lib/trapFocus";
import type {
  BreakObservationWithEmotions,
  BuildObservation,
  HabitWithConfigs,
} from "@/types/database";

interface DaySheetProps {
  date: string;
  hasEngineActivity: boolean;
  breakObs: BreakObservationWithEmotions[];
  buildObs: BuildObservation[];
  breakHabits: HabitWithConfigs[];
  buildHabits: HabitWithConfigs[];
  isFuture: boolean;
  onClose: () => void;
}

export function DaySheet({
  date,
  hasEngineActivity,
  breakObs,
  buildObs,
  breakHabits,
  buildHabits,
  isFuture,
  onClose,
}: DaySheetProps) {
  const navigate = useNavigate();
  const displayDate = format(
    parse(date, "yyyy-MM-dd", new Date()),
    "EEEE, d MMMM",
  );
  const goToEngine = () => {
    onClose();
    navigate({ to: "/engine", search: { date } });
  };
  const goToBreakHabit = (habitId: string) => {
    onClose();
    navigate({ to: "/break/$habitId", params: { habitId }, search: { date } });
  };
  const goToBuildHabit = (habitId: string) => {
    onClose();
    navigate({ to: "/build/$habitId", params: { habitId }, search: { date } });
  };

  const visibleBreakHabits = breakHabits.filter((h) =>
    isHabitVisibleForDay(
      h,
      breakObs.some((o) => o.habit_id === h.id),
    ),
  );
  const visibleBuildHabits = buildHabits.filter((h) =>
    isHabitVisibleForDay(
      h,
      buildObs.some((o) => o.habit_id === h.id),
    ),
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.isComposing) {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        trapFocus(e, panelRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 bg-plum/40 z-[200] touch-none"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={displayDate}
        tabIndex={-1}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-canvas rounded-t-[24px] z-[201] max-h-[80dvh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <p className="font-serif italic text-[18px] text-plum">
            {displayDate}
          </p>
          <IconButton
            onClick={onClose}
            ariaLabel="Close"
            className="text-muted"
          >
            <X size={18} />
          </IconButton>
        </div>

        <div className="flex flex-col gap-5 px-6 pb-8">
          {/* Engine */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-dark shrink-0" />
              <p className="font-sans text-[11px] font-medium text-blue-dark uppercase tracking-[0.08em]">
                Engine
              </p>
            </div>
            {hasEngineActivity ? (
              <div className="bg-card rounded-2xl px-4 py-3">
                <p className="font-sans text-[13px] text-plum">
                  Activity logged
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3">
                <p className="font-sans text-[13px] text-muted">Not logged</p>
                {!isFuture && (
                  <button
                    type="button"
                    onClick={goToEngine}
                    className="font-sans text-[11px] font-medium text-blue-dark bg-transparent border-none cursor-pointer"
                  >
                    Go to Engine →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Break habits */}
          {visibleBreakHabits.map((habit) => {
            const obs = breakObs.filter((o) => o.habit_id === habit.id);
            return (
              <div key={habit.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-dark shrink-0" />
                  <p className="font-sans text-[11px] font-medium text-teal-dark uppercase tracking-[0.08em]">
                    {habit.name}
                  </p>
                </div>
                {obs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {obs.map((o) => (
                      <div
                        key={o.id}
                        className="bg-card rounded-2xl px-4 py-3 flex flex-col gap-1"
                      >
                        {o.job && (
                          <p className="font-sans text-[13px] font-medium text-plum">
                            {o.job}
                          </p>
                        )}
                        {o.context && (
                          <p className="font-sans text-[12px] text-muted">
                            {o.context}
                          </p>
                        )}
                        {o.urge_intensity !== null && (
                          <p className="font-sans text-[11px] text-muted">
                            Urge: {o.urge_intensity}/10
                          </p>
                        )}
                        {o.emotions.length > 0 && (
                          <p className="font-sans text-[11px] text-muted">
                            {o.emotions.map((e) => e.value).join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3">
                    <p className="font-sans text-[13px] text-muted">
                      Not logged
                    </p>
                    {!isFuture && (
                      <button
                        type="button"
                        onClick={() => goToBreakHabit(habit.id)}
                        className="font-sans text-[11px] font-medium text-teal-dark bg-transparent border-none cursor-pointer"
                      >
                        Add it
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Build habits */}
          {visibleBuildHabits.map((habit) => {
            const obs = buildObs.filter((o) => o.habit_id === habit.id);
            return (
              <div key={habit.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber shrink-0" />
                  <p className="font-sans text-[11px] font-medium text-amber uppercase tracking-[0.08em]">
                    {habit.name}
                  </p>
                </div>
                {obs.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {obs.map((o) => (
                      <div
                        key={o.id}
                        className="bg-card rounded-2xl px-4 py-3 flex flex-col gap-1"
                      >
                        <p className="font-sans text-[13px] font-medium text-plum">
                          {o.sub_type ? `${o.sub_type} · ` : ""}
                          {o.mark_label}
                        </p>
                        {o.note && (
                          <p className="font-sans text-[12px] text-muted">
                            {o.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-card rounded-2xl px-4 py-3">
                    <p className="font-sans text-[13px] text-muted">
                      Not logged
                    </p>
                    {!isFuture && (
                      <button
                        type="button"
                        onClick={() => goToBuildHabit(habit.id)}
                        className="font-sans text-[11px] font-medium text-amber bg-transparent border-none cursor-pointer"
                      >
                        Add it
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visibleBreakHabits.length === 0 &&
            visibleBuildHabits.length === 0 &&
            !hasEngineActivity && (
              <p className="font-sans text-[13px] text-muted text-center py-4">
                Nothing logged this day.
              </p>
            )}
        </div>
      </div>
    </>
  );
}
