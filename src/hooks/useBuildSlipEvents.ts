import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export interface BuildSlipEvent {
  id: string;
  habit_id: string;
  triggered_at: string;
  cause_category: "distress_tolerance" | "logistics" | "emotional_load" | null;
  emotional_state_before: string | null;
  all_or_nothing_stage: string | null;
}

export function useBuildSlipEvents(userId: string) {
  return useQuery({
    queryKey: ["build_slip_events", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slip_drift_log")
        .select(
          "id, habit_id, triggered_at, cause_category, emotional_state_before, all_or_nothing_stage",
        )
        .eq("user_id", userId)
        .eq("track_type", "build")
        .eq("type", "slip");
      if (error) throw error;
      return (data ?? []).filter(
        (row): row is BuildSlipEvent => row.habit_id !== null,
      );
    },
    enabled: !!userId,
  });
}
