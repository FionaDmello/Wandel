import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format } from "date-fns";

import { useEngineActivityDates } from "@/hooks/useEngineActivityDates";
import { supabase } from "@/lib/supabase";
import type {
  BreakObservationWithEmotions,
  BuildObservation,
} from "@/types/database";

function monthRange(year: number, month: number) {
  const first = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = format(endOfMonth(new Date(year, month - 1, 1)), "yyyy-MM-dd");
  return { first, last };
}

export function useMonthBreakObservations(
  userId: string,
  year: number,
  month: number,
) {
  const { first, last } = monthRange(year, month);
  return useQuery({
    queryKey: ["break_observations_month", userId, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("break_observations")
        .select("*, emotions:break_observation_emotions(*)")
        .eq("user_id", userId)
        .gte("logged_at", `${first}T00:00:00.000Z`)
        .lte("logged_at", `${last}T23:59:59.999Z`)
        .order("logged_at");

      if (error) throw error;
      return data as BreakObservationWithEmotions[];
    },
    enabled: !!userId,
  });
}

export function useMonthBuildObservations(
  userId: string,
  year: number,
  month: number,
) {
  const { first, last } = monthRange(year, month);
  return useQuery({
    queryKey: ["build_observations_month", userId, year, month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_observations")
        .select("*")
        .eq("user_id", userId)
        .gte("date", first)
        .lte("date", last)
        .order("date");

      if (error) throw error;
      return data as BuildObservation[];
    },
    enabled: !!userId,
  });
}

export function useMonthEngineActivity(
  userId: string,
  year: number,
  month: number,
) {
  const { first, last } = monthRange(year, month);
  return useEngineActivityDates(userId, { from: first, to: last });
}
