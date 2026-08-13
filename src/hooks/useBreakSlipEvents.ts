import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export interface BreakSlipEvent {
  id: string;
  habit_id: string;
  triggered_at: string;
  job_id: string | null;
  cause_category: "distress_tolerance" | "logistics" | "emotional_load" | null;
  emotional_state_before: string | null;
  all_or_nothing_stage: string | null;
}

export function useBreakSlipEvents(userId: string) {
  return useQuery({
    queryKey: ["break_slip_events", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slip_drift_log")
        .select(
          "id, habit_id, triggered_at, job_id, cause_category, emotional_state_before, all_or_nothing_stage",
        )
        .eq("user_id", userId)
        .eq("track_type", "break")
        .eq("type", "slip");
      if (error) throw error;
      return (data ?? []).filter(
        (row): row is BreakSlipEvent => row.habit_id !== null,
      );
    },
    enabled: !!userId,
  });
}
