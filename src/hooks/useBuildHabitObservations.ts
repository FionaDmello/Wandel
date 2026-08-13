import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BuildObservation } from "@/types/database";

export function useBuildHabitObservations(userId: string, habitId: string) {
  return useQuery({
    queryKey: ["build_habit_observations", userId, habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_observations")
        .select("*")
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as BuildObservation[];
    },
    enabled: !!userId && !!habitId,
  });
}
