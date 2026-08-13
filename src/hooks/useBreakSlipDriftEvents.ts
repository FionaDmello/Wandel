import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { ProtocolType } from "@/types/database";

export interface BreakSlipDriftEvent {
  habit_id: string;
  triggered_at: string;
  type: ProtocolType;
}

export function useBreakSlipDriftEvents(userId: string) {
  return useQuery({
    queryKey: ["break_slip_drift_events", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slip_drift_log")
        .select("habit_id, triggered_at, type")
        .eq("user_id", userId)
        .eq("track_type", "break");
      if (error) throw error;
      return (data ?? []).filter(
        (row): row is BreakSlipDriftEvent => row.habit_id !== null,
      );
    },
    enabled: !!userId,
  });
}
