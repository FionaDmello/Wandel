import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInDays, format, parseISO } from "date-fns";

import { supabase } from "@/lib/supabase";
import type { BuildObservation, MarkType } from "@/types/database";

export function useBuildObservation(
  userId: string,
  habitId: string,
  date: string,
) {
  return useQuery({
    queryKey: ["build_observation", userId, habitId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_observations")
        .select("*")
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .eq("date", date)
        .maybeSingle();

      if (error) throw error;
      return data as BuildObservation | null;
    },
    enabled: !!userId && !!habitId,
  });
}

export function useHabitDayObservations(
  userId: string,
  habitId: string,
  date?: string,
) {
  const effectiveDate = date ?? format(new Date(), "yyyy-MM-dd");
  return useQuery({
    queryKey: ["build_observations_day", userId, habitId, effectiveDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("build_observations")
        .select("*")
        .eq("user_id", userId)
        .eq("habit_id", habitId)
        .eq("date", effectiveDate);

      if (error) throw error;
      return data as BuildObservation[];
    },
    enabled: !!userId && !!habitId,
  });
}

export function useUpsertBuildObservation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id?: string;
      habit_id: string;
      date: string;
      sub_type?: string | null;
      mark_type: MarkType;
      mark_label: string;
      note?: string;
    }) => {
      const { id, ...fields } = payload;

      if (id) {
        const { data, error } = await supabase
          .from("build_observations")
          .update({
            mark_type: fields.mark_type,
            mark_label: fields.mark_label,
            note: fields.note ?? null,
          })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as BuildObservation;
      }

      const { data, error } = await supabase
        .from("build_observations")
        .insert({ user_id: userId, ...fields })
        .select()
        .single();
      if (error) throw error;
      return data as BuildObservation;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: ["build_observations_day", userId, data.habit_id, data.date],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_observation", userId, data.habit_id, data.date],
      });

      try {
        // Standing up is derived from real logged gaps, never from the
        // decorative "I am returning" drift acknowledgment.
        const { data: previous } = await supabase
          .from("build_observations")
          .select("date")
          .eq("user_id", userId)
          .eq("habit_id", data.habit_id)
          .lt("date", data.date)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!previous) return;

        const fallDate = format(
          addDays(parseISO(previous.date), 1),
          "yyyy-MM-dd",
        );
        if (fallDate >= data.date) return;

        const { data: existing } = await supabase
          .from("standing_up_log")
          .select("id")
          .eq("user_id", userId)
          .eq("habit_id", data.habit_id)
          .eq("fall_date", fallDate)
          .maybeSingle();

        if (existing) return;

        const { data: habit } = await supabase
          .from("habits")
          .select("name")
          .eq("id", data.habit_id)
          .single();

        if (!habit) return;

        const gapDays = differenceInDays(
          parseISO(data.date),
          parseISO(fallDate),
        );

        await supabase.from("standing_up_log").insert({
          user_id: userId,
          habit_id: data.habit_id,
          track_type: "build",
          track_name: habit.name,
          protocol: gapDays === 1 ? "slip" : "drift",
          fall_date: fallDate,
          return_date: data.date,
          gap_days: gapDays,
        });

        queryClient.invalidateQueries({
          queryKey: ["standing_up_log", userId],
        });
      } catch {
        // Standing up write is best-effort; don't fail the mutation
      }
    },
  });
}
