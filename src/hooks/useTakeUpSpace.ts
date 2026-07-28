import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import type {
  TakeUpSpaceEntry,
  TakeUpSpaceMode,
  TakeUpSpaceOutcome,
  TakeUpSpacePanelTag,
} from "@/types/takeUpSpace";

interface UpdateEntryPayload {
  id: string;
  situation?: string | null;
  action?: string | null;
  cost?: string | null;
  need?: string | null;
  choice_text?: string | null;
  teaching?: string | null;
  tag_ids?: string[];
  tag_names?: string[];
  choice_outcome?: string | null;
  panel_tag?: string | null;
  mode?: TakeUpSpaceMode;
}

export function useTakeUpSpaceEntries(userId: string) {
  return useQuery({
    queryKey: ["take_up_space_log", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("take_up_space_log")
        .select("*")
        .eq("user_id", userId)
        .order("status", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TakeUpSpaceEntry[];
    },
    enabled: !!userId,
  });
}

export function useActiveDraft(userId: string) {
  return useQuery({
    queryKey: ["take_up_space_log", userId, "draft"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("take_up_space_log")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "draft")
        .maybeSingle();
      if (error) throw error;
      return data as TakeUpSpaceEntry | null;
    },
    enabled: !!userId,
  });
}

export function useCreateTakeUpSpaceEntry(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date }: { date: string }) => {
      const { data, error } = await supabase
        .from("take_up_space_log")
        .insert({
          user_id: userId,
          date,
          status: "draft",
          mode: "in_the_moment",
        })
        .select()
        .single();
      if (error) throw error;
      return data as TakeUpSpaceEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_log", userId],
      });
    },
  });
}

export function useUpdateTakeUpSpaceEntry(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateEntryPayload) => {
      const { error } = await supabase
        .from("take_up_space_log")
        .update(fields)
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_log", userId],
      });
    },
  });
}

interface CompleteEntryPayload {
  id: string;
  mode: TakeUpSpaceMode;
  choice_outcome: TakeUpSpaceOutcome;
  panel_tag: TakeUpSpacePanelTag | null;
  tag_ids: string[];
  tag_names: string[];
}

export function useCompleteEntry(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: CompleteEntryPayload) => {
      const { error } = await supabase
        .from("take_up_space_log")
        .update({
          ...fields,
          status: "complete",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_log", userId],
      });
    },
  });
}

export function useAbandonDraft(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("take_up_space_log")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_log", userId],
      });
    },
  });
}

export function useUpdateCostField(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cost }: { id: string; cost: string }) => {
      const { error } = await supabase
        .from("take_up_space_log")
        .update({ cost })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_log", userId],
      });
    },
  });
}
