import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BreakObservationWithEmotions } from "@/types/database";

export function useBreakObservationById(userId: string, id: string) {
  return useQuery({
    queryKey: ["break_observation", userId, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("break_observations")
        .select("*, emotions:break_observation_emotions(*)")
        .eq("user_id", userId)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as BreakObservationWithEmotions;
    },
    enabled: !!userId && !!id,
  });
}
