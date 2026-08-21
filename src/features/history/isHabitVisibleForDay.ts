import type { HabitWithConfigs } from "@/types/database";

export function isHabitVisibleForDay(
  habit: HabitWithConfigs,
  hasObservation: boolean,
): boolean {
  if (habit.status === "scheduled") return false;
  if (habit.status === "deactivated") return hasObservation;
  return true;
}
