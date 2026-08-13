import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BreakObservationWithEmotions } from "@/types/database";

export function useBreakHabitObservations(userId: string, habitId: string) {
  return useQuery({
    queryKey: ["break_habit_observations", userId, habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("break_observations")
        .select("*, emotions:break_observation_emotions(*)")
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .not("urge_intensity", "is", null)
        .order("logged_at", { ascending: false });
      if (error) throw error;
      return data as BreakObservationWithEmotions[];
    },
    enabled: !!userId && !!habitId,
  });
}
