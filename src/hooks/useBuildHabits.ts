import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type { Habit, HabitStatus, HabitWithConfigs } from "@/types/database";

export interface SubTypeConfig {
  subType: string | null;
  anchor: string;
  nonNegotiable: string;
  minimumVersion: string;
  fullVersion: string;
}

interface RenameBuildVariationArgs {
  p_habit_id: string;
  p_old_sub_type: string | null;
  p_new_sub_type: string | null;
  p_anchor: string;
  p_non_negotiable: string;
  p_minimum_version: string;
  p_full_version: string;
}

interface DeleteBuildVariationArgs {
  p_habit_id: string;
  p_sub_type: string;
}

// The hand-maintained `Database` type in src/types/database.ts keeps
// `Functions: Record<string, never>` deliberately — adding real entries
// there breaks postgrest-js's embedded-select type resolution
// (`configs:habit_configs(*)` etc.) across every other hook in this
// codebase, verified against both the current and latest supabase-js.
// These two RPCs are typed locally instead, isolated to this file.
function renameBuildVariation(
  args: RenameBuildVariationArgs,
): Promise<{ error: PostgrestError | null }> {
  return (
    supabase.rpc as unknown as (
      fn: "rename_build_variation",
      args: RenameBuildVariationArgs,
    ) => Promise<{ error: PostgrestError | null }>
  )("rename_build_variation", args);
}

function deleteBuildVariation(
  args: DeleteBuildVariationArgs,
): Promise<{ error: PostgrestError | null }> {
  return (
    supabase.rpc as unknown as (
      fn: "delete_build_variation",
      args: DeleteBuildVariationArgs,
    ) => Promise<{ error: PostgrestError | null }>
  )("delete_build_variation", args);
}

export function useBuildHabits(userId: string) {
  return useQuery({
    queryKey: ["build_habits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*, configs:habit_configs(*)")
        .eq("user_id", userId)
        .eq("category", "build")
        .order("sort_order");

      if (error) throw error;
      return data as HabitWithConfigs[];
    },
    enabled: !!userId,
  });
}

export function useBuildHabit(userId: string, habitId: string) {
  return useQuery({
    queryKey: ["build_habit", userId, habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*, configs:habit_configs(*)")
        .eq("user_id", userId)
        .eq("id", habitId)
        .single();

      if (error) throw error;
      return data as HabitWithConfigs;
    },
    enabled: !!userId && !!habitId,
  });
}

export function useAddBuildHabit(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      configs: SubTypeConfig[];
      status?: HabitStatus;
    }) => {
      const { data: habit, error: habitError } = await supabase
        .from("habits")
        .insert({
          user_id: userId,
          category: "build",
          name: payload.name,
          status: payload.status ?? "active",
        })
        .select()
        .single();

      if (habitError) throw habitError;

      const rows = payload.configs.flatMap((cfg, cfgIdx) =>
        [
          { key: "anchor", value: cfg.anchor },
          { key: "non_negotiable", value: cfg.nonNegotiable },
          { key: "minimum_version", value: cfg.minimumVersion },
          { key: "full_version", value: cfg.fullVersion },
        ].map((row, rowIdx) => ({
          habit_id: (habit as Habit).id,
          key: row.key,
          value: row.value,
          sub_type: cfg.subType,
          sort_order: cfgIdx * 4 + rowIdx,
        })),
      );

      if (rows.length > 0) {
        const { error: configError } = await supabase
          .from("habit_configs")
          .insert(rows);

        if (configError) throw configError;
      }

      return habit as Habit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["build_habits", userId] });
    },
  });
}

export function useAddBuildSubType(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      habitId: string;
      subType: string;
      anchor: string;
      nonNegotiable: string;
      minimumVersion: string;
      fullVersion: string;
    }) => {
      const { error } = await supabase.from("habit_configs").insert([
        {
          habit_id: payload.habitId,
          key: "anchor",
          value: payload.anchor,
          sub_type: payload.subType,
          sort_order: 0,
        },
        {
          habit_id: payload.habitId,
          key: "non_negotiable",
          value: payload.nonNegotiable,
          sub_type: payload.subType,
          sort_order: 1,
        },
        {
          habit_id: payload.habitId,
          key: "minimum_version",
          value: payload.minimumVersion,
          sub_type: payload.subType,
          sort_order: 2,
        },
        {
          habit_id: payload.habitId,
          key: "full_version",
          value: payload.fullVersion,
          sub_type: payload.subType,
          sort_order: 3,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({
        queryKey: ["build_habit", userId, habitId],
      });
      queryClient.invalidateQueries({ queryKey: ["build_habits", userId] });
    },
  });
}

export function useUpdateBuildSubType(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      habitId: string;
      subType: string | null;
      newSubType: string | null;
      anchor: string;
      nonNegotiable: string;
      minimumVersion: string;
      fullVersion: string;
    }) => {
      const { error } = await renameBuildVariation({
        p_habit_id: payload.habitId,
        p_old_sub_type: payload.subType,
        p_new_sub_type: payload.newSubType,
        p_anchor: payload.anchor,
        p_non_negotiable: payload.nonNegotiable,
        p_minimum_version: payload.minimumVersion,
        p_full_version: payload.fullVersion,
      });

      if (error) throw error;
    },
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({
        queryKey: ["build_habit", userId, habitId],
      });
      queryClient.invalidateQueries({ queryKey: ["build_habits", userId] });
      queryClient.invalidateQueries({
        queryKey: ["build_observation", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_observations_day", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_habit_observations", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_observations_month", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekly_consistency", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_obs_recent", userId],
      });
    },
  });
}

export function useDeleteBuildSubType(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { habitId: string; subType: string }) => {
      const { error } = await deleteBuildVariation({
        p_habit_id: payload.habitId,
        p_sub_type: payload.subType,
      });

      if (error) throw error;
    },
    onSuccess: (_, { habitId }) => {
      queryClient.invalidateQueries({
        queryKey: ["build_habit", userId, habitId],
      });
      queryClient.invalidateQueries({ queryKey: ["build_habits", userId] });
      queryClient.invalidateQueries({
        queryKey: ["build_observation", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_observations_day", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_habit_observations", userId, habitId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_observations_month", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekly_consistency", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["build_obs_recent", userId],
      });
    },
  });
}
