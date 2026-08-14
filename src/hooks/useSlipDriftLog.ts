import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays } from "date-fns";

import { supabase } from "@/lib/supabase";
import type { ProtocolType, SlipDriftEntry, TrackType } from "@/types/database";

interface SlipDriftPayload {
  track_type: TrackType;
  type: ProtocolType;
  habit_id?: string | null;
  job_id?: string | null;
  cause_category?: "distress_tolerance" | "logistics" | "emotional_load" | null;
  emotional_state_before?: string | null;
  all_or_nothing_stage?: string | null;
  protocol_completed?: boolean;
}

export function useLogSlipDrift(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SlipDriftPayload) => {
      const { data, error } = await supabase
        .from("slip_drift_log")
        .insert({ user_id: userId, ...payload })
        .select()
        .single();
      if (error) throw error;
      return data as SlipDriftEntry;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`${variables.track_type}_slip_events`, userId],
      });
    },
  });
}

export function useRecentEngineDriftCount(userId: string) {
  return useQuery({
    queryKey: ["engine_drift_count_recent", userId],
    queryFn: async () => {
      const since = format(subDays(new Date(), 60), "yyyy-MM-dd");
      const { count, error } = await supabase
        .from("slip_drift_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("track_type", "engine")
        .eq("type", "drift")
        .gte("triggered_at", `${since}T00:00:00.000Z`);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}
