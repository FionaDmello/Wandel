import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { BreakObservation } from "@/types/database";

export function useUpdateBreakObservation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      job: string;
      context?: string;
      urge_intensity: number;
      emotions: string[];
    }) => {
      const { id, emotions, ...fields } = payload;

      const { data, error } = await supabase
        .from("break_observations")
        .update(fields)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from("break_observation_emotions")
        .delete()
        .eq("observation_id", id);

      if (emotions.length > 0) {
        await supabase
          .from("break_observation_emotions")
          .insert(emotions.map((value) => ({ observation_id: id, value })));
      }

      return data as BreakObservation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["break_observations", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["break_habit_observations", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["break_observation", userId, data.id],
      });
    },
  });
}
