import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export interface BreakSlipEvent {
  habit_id: string;
  triggered_at: string;
}

export function useBreakSlipEvents(userId: string) {
  return useQuery({
    queryKey: ["break_slip_events", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slip_drift_log")
        .select("habit_id, triggered_at")
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
