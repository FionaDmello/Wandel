import { format, subDays } from "date-fns";

import type { Habit } from "@/types/database";
import type { PendingProtocol } from "@/types/protocols";

function countConsecutiveMisses(
  habitId: string,
  category: "break" | "build",
  obsByDate: Map<string, Set<string>>,
  today: string,
): number {
  let count = 0;
  for (let i = 1; i <= 10; i++) {
    const date = format(subDays(new Date(today), i), "yyyy-MM-dd");
    const hasObs = !!obsByDate.get(date)?.has(habitId);
    // break habit: a slip (observation exists) is a miss; build habit: no observation is a miss
    const isMiss = category === "break" ? hasObs : !hasObs;
    if (!isMiss) break;
    count++;
  }
  return count;
}

export function detectHabitDrift(
  activeHabits: Habit[],
  breakObsByDate: Map<string, Set<string>>,
  buildObsByDate: Map<string, Set<string>>,
  today: string,
): PendingProtocol[] {
  const drifting: Array<{ habit: Habit; missedDays: number }> = [];

  for (const habit of activeHabits) {
    if (habit.status !== "active") continue;
    const obsByDate =
      habit.category === "break" ? breakObsByDate : buildObsByDate;
    const missed = countConsecutiveMisses(
      habit.id,
      habit.category,
      obsByDate,
      today,
    );
    if (missed >= 2) drifting.push({ habit, missedDays: missed });
  }

  drifting.sort((a, b) => b.missedDays - a.missedDays);

  return drifting.map(({ habit, missedDays }) => ({
    id: "habit_drift" as const,
    habitId: habit.id,
    trackType: habit.category,
    trackName: habit.name,
    driftDays: missedDays,
    currentStep: 0,
  }));
}

export function detectEngineDrift(
  engineMarkDates: Set<string>,
  today: string,
): PendingProtocol | null {
  let missed = 0;
  for (let i = 1; i <= 10; i++) {
    const date = format(subDays(new Date(today), i), "yyyy-MM-dd");
    if (engineMarkDates.has(date)) break;
    missed++;
  }

  if (missed >= 7) {
    return {
      id: "engine_drift",
      habitId: null,
      trackType: "engine",
      trackName: "Engine",
      driftDays: missed,
      currentStep: 0,
    };
  }

  if (missed >= 3) {
    return {
      id: "engine_slip",
      habitId: null,
      trackType: "engine",
      trackName: "Engine",
      driftDays: missed,
      currentStep: 0,
    };
  }

  return null;
}
