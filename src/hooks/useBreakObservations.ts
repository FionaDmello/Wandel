import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type {
  BreakObservation,
  BreakObservationWithEmotions,
} from "@/types/database";

export function useBreakObservations(userId: string, date: string) {
  return useQuery({
    queryKey: ["break_observations", userId, date],
    queryFn: async () => {
      const start = `${date}T00:00:00.000Z`;
      const end = `${date}T23:59:59.999Z`;

      const { data, error } = await supabase
        .from("break_observations")
        .select("*, break_observation_emotions(*)")
        .eq("user_id", userId)
        .gte("logged_at", start)
        .lte("logged_at", end)
        .order("logged_at");

      if (error) throw error;
      return data as BreakObservationWithEmotions[];
    },
    enabled: !!userId,
  });
}

export function useLogBreakObservation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      habit_id: string;
      job?: string;
      context?: string;
      urge_intensity?: number;
      emotions: string[];
      logged_at?: string;
    }) => {
      const { emotions, ...observationPayload } = payload;

      const { data: observation, error: observationError } = await supabase
        .from("break_observations")
        .insert({ user_id: userId, ...observationPayload })
        .select()
        .single();

      if (observationError) throw observationError;

      if (emotions.length > 0) {
        const { error: emotionsError } = await supabase
          .from("break_observation_emotions")
          .insert(
            emotions.map((value) => ({
              observation_id: (observation as BreakObservation).id,
              value,
            })),
          );

        if (emotionsError) throw emotionsError;
      }

      return observation as BreakObservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["break_observations", userId],
      });
    },
  });
}

export function useUpdateBreakObservationAftermath() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      aftermath: string;
      emotions: string[];
      userId: string;
    }) => {
      const { id, aftermath, emotions, userId } = payload;

      const { data, error } = await supabase
        .from("break_observations")
        .update({ aftermath })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const { error: deleteError } = await supabase
        .from("break_observation_emotions")
        .delete()
        .eq("observation_id", id);

      if (deleteError) throw deleteError;

      if (emotions.length > 0) {
        const { error: emotionsError } = await supabase
          .from("break_observation_emotions")
          .insert(emotions.map((value) => ({ observation_id: id, value })));

        if (emotionsError) throw emotionsError;
      }

      queryClient.invalidateQueries({
        queryKey: ["break_observations", userId],
      });

      return data as BreakObservation;
    },
  });
}
