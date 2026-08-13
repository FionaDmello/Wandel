import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

import { computeStandingUpResolutions } from "@/features/protocols/computeStandingUp";
import { useBreakHabits } from "@/hooks/useBreakHabits";
import { useBreakSlipDriftEvents } from "@/hooks/useBreakSlipDriftEvents";
import { useAllStandingUpEntries } from "@/hooks/useStandingUpLog";
import { supabase } from "@/lib/supabase";
import type { ProtocolType, StandingUpEntry } from "@/types/database";

interface StandingUpInsertPayload {
  habit_id: string;
  track_type: "break";
  track_name: string;
  protocol: ProtocolType;
  gap_days: number;
  fall_date: string;
  return_date: string;
}

function useLogStandingUpEntries(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payloads: StandingUpInsertPayload[]) => {
      const { data, error } = await supabase
        .from("standing_up_log")
        .insert(payloads.map((p) => ({ user_id: userId, ...p })))
        .select();
      if (error) throw error;
      return data as StandingUpEntry[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["standing_up_log", userId],
      });
    },
  });
}

export function useSyncBreakStandingUp(userId: string): void {
  const breakHabitsQuery = useBreakHabits(userId);
  const eventsQuery = useBreakSlipDriftEvents(userId);
  const standingUpQuery = useAllStandingUpEntries(userId);
  const { mutate: logEntries } = useLogStandingUpEntries(userId);

  const didSync = useRef(false);

  useEffect(() => {
    if (didSync.current) return;
    if (
      !breakHabitsQuery.isSuccess ||
      !eventsQuery.isSuccess ||
      !standingUpQuery.isSuccess
    ) {
      return;
    }
    didSync.current = true;

    const today = format(new Date(), "yyyy-MM-dd");
    const breakHabits = breakHabitsQuery.data ?? [];
    const events = eventsQuery.data ?? [];
    const existingEntries = standingUpQuery.data ?? [];

    const payloads: StandingUpInsertPayload[] = [];

    for (const habit of breakHabits) {
      if (habit.status !== "active") continue;

      const habitEvents = events.filter((e) => e.habit_id === habit.id);
      if (habitEvents.length === 0) continue;

      const resolvedThrough = existingEntries
        .filter((e) => e.habit_id === habit.id)
        .reduce<
          string | null
        >((max, e) => (max === null || e.return_date > max ? e.return_date : max), null);

      const fallDates = habitEvents
        .map((e) => e.triggered_at.slice(0, 10))
        .filter((date) => resolvedThrough === null || date > resolvedThrough);

      const resolutions = computeStandingUpResolutions(fallDates, today);

      for (const resolution of resolutions) {
        const eventAtFall = habitEvents.find(
          (e) => e.triggered_at.slice(0, 10) === resolution.fallDate,
        );
        payloads.push({
          habit_id: habit.id,
          track_type: "break",
          track_name: habit.name,
          protocol: eventAtFall?.type ?? "slip",
          gap_days: resolution.gapDays,
          fall_date: resolution.fallDate,
          return_date: resolution.returnDate,
        });
      }
    }

    if (payloads.length > 0) {
      logEntries(payloads);
    }
  }, [
    breakHabitsQuery.isSuccess,
    breakHabitsQuery.data,
    eventsQuery.isSuccess,
    eventsQuery.data,
    standingUpQuery.isSuccess,
    standingUpQuery.data,
    userId,
    logEntries,
  ]);
}
