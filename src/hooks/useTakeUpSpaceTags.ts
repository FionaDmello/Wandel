import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_TAKE_UP_SPACE_TAGS } from "@/constants/defaultTakeUpSpaceTags";
import { supabase } from "@/lib/supabase";
import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

interface SaveTagPayload {
  id: string;
  name: string;
  is_default: boolean;
  active: boolean;
}

export function useTakeUpSpaceTags(userId: string) {
  return useQuery({
    queryKey: ["take_up_space_tags", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("take_up_space_tags")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as TakeUpSpaceTag[];
    },
    enabled: !!userId,
  });
}

export function useSeedDefaultTags(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tags = DEFAULT_TAKE_UP_SPACE_TAGS.map((name) => ({
        id: crypto.randomUUID(),
        user_id: userId,
        name,
        is_default: true,
        active: true,
      }));
      const { error } = await supabase.from("take_up_space_tags").insert(tags);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_tags", userId],
      });
    },
  });
}

export function useDeleteTag(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("take_up_space_tags")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_tags", userId],
      });
    },
  });
}

export function useSaveTags(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SaveTagPayload) => {
      const { data, error } = await supabase
        .from("take_up_space_tags")
        .upsert({ user_id: userId, ...payload })
        .select()
        .single();
      if (error) throw error;
      return data as TakeUpSpaceTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["take_up_space_tags", userId],
      });
    },
  });
}
