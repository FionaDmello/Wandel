import { useNavigate } from "@tanstack/react-router";
import { format, parse } from "date-fns";
import { X } from "lucide-react";

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
  const goTo = (path: string) => {
    onClose();
    navigate({ to: path as "/engine" });
  };
  const goToEngine = () => {
    onClose();
    navigate({ to: "/engine", search: { date } });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-plum/40 z-[200]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-canvas rounded-t-[24px] z-[201] max-h-[80dvh] overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <p className="font-serif italic text-[18px] text-plum">
            {displayDate}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted bg-transparent border-none cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 pb-8">
          {/* Engine */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber shrink-0" />
              <p className="font-sans text-[11px] font-medium text-amber uppercase tracking-[0.08em]">
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
                    className="font-sans text-[11px] font-medium text-amber bg-transparent border-none cursor-pointer"
                  >
                    Go to Engine →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Break habits */}
          {breakHabits
            .filter((h) => h.status !== "scheduled")
            .map((habit) => {
              const obs = breakObs.filter((o) => o.habit_id === habit.id);
              return (
                <div key={habit.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                    <p className="font-sans text-[11px] font-medium text-teal uppercase tracking-[0.08em]">
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
                          onClick={() =>
                            goTo(
                              `/break/${habit.id}?date=${date}` as "/break/$habitId",
                            )
                          }
                          className="font-sans text-[11px] font-medium text-teal bg-transparent border-none cursor-pointer"
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
          {buildHabits
            .filter((h) => h.status !== "scheduled")
            .map((habit) => {
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
                          onClick={() =>
                            goTo(
                              `/build/${habit.id}/log?date=${date}` as "/build/$habitId/log",
                            )
                          }
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

          {breakHabits.length === 0 &&
            buildHabits.length === 0 &&
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
