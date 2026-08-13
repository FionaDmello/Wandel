import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";

import { fetchEngineActivityDates } from "@/hooks/useEngineActivityDates";
import { supabase } from "@/lib/supabase";
import type { WeeklyConsistencyData } from "@/types/review";

function weekStart(weekEnding: string): string {
  return format(subDays(parseISO(weekEnding), 6), "yyyy-MM-dd");
}

function countDistinctDaysByHabit(
  rows: Array<{ habit_id: string; logged_at?: string; date?: string }>,
): Record<string, number> {
  const daysByHabit: Record<string, Set<string>> = {};
  for (const row of rows) {
    const day = row.date ?? row.logged_at!.slice(0, 10);
    if (!daysByHabit[row.habit_id]) daysByHabit[row.habit_id] = new Set();
    daysByHabit[row.habit_id].add(day);
  }
  return Object.fromEntries(
    Object.entries(daysByHabit).map(([id, days]) => [id, days.size]),
  );
}

export function useWeeklyConsistency(userId: string, weekEnding: string) {
  return useQuery({
    queryKey: ["weekly_consistency", userId, weekEnding],
    queryFn: async (): Promise<WeeklyConsistencyData> => {
      const start = weekStart(weekEnding);
      const [engineActivityDates, breakResult, buildResult] = await Promise.all(
        [
          fetchEngineActivityDates(userId, { from: start, to: weekEnding }),
          supabase
            .from("slip_drift_log")
            .select("habit_id, triggered_at")
            .eq("user_id", userId)
            .eq("track_type", "break")
            .eq("type", "slip")
            .gte("triggered_at", `${start}T00:00:00`)
            .lte("triggered_at", `${weekEnding}T23:59:59`)
            .order("triggered_at"),
          supabase
            .from("build_observations")
            .select("habit_id, date")
            .eq("user_id", userId)
            .gte("date", start)
            .lte("date", weekEnding)
            .order("date"),
        ],
      );

      if (breakResult.error) throw breakResult.error;
      if (buildResult.error) throw buildResult.error;

      const breakSlipRows = (
        breakResult.data as { habit_id: string | null; triggered_at: string }[]
      )
        .filter((r) => r.habit_id !== null)
        .map((r) => ({
          habit_id: r.habit_id as string,
          logged_at: r.triggered_at,
        }));

      return {
        engineMarked: engineActivityDates.length,
        breakObsDaysByHabit: countDistinctDaysByHabit(breakSlipRows),
        buildObsDaysByHabit: countDistinctDaysByHabit(buildResult.data),
      };
    },
    enabled: !!userId && !!weekEnding,
  });
}
