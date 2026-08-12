import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";

export async function fetchEngineActivityDates(
  userId: string,
  range: { from: string; to: string },
): Promise<string[]> {
  const [hardThings, selfLove, selfWorth, tusLog] = (await Promise.all([
    supabase
      .from("hard_things_log")
      .select("date")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to),
    supabase
      .from("self_love_log")
      .select("date")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to),
    supabase
      .from("self_worth_evidence")
      .select("date")
      .eq("user_id", userId)
      .gte("date", range.from)
      .lte("date", range.to),
    supabase
      .from("take_up_space_log")
      .select("date")
      .eq("user_id", userId)
      .eq("status", "complete")
      .gte("date", range.from)
      .lte("date", range.to),
  ])) as [
    { data: Array<{ date: string }> | null; error: unknown },
    { data: Array<{ date: string }> | null; error: unknown },
    { data: Array<{ date: string }> | null; error: unknown },
    { data: Array<{ date: string }> | null; error: unknown },
  ];

  if (hardThings.error) throw hardThings.error;
  if (selfLove.error) throw selfLove.error;
  if (selfWorth.error) throw selfWorth.error;
  if (tusLog.error) throw tusLog.error;

  const dates = [
    ...(hardThings.data ?? []),
    ...(selfLove.data ?? []),
    ...(selfWorth.data ?? []),
    ...(tusLog.data ?? []),
  ].map((row) => row.date);

  return [...new Set(dates)];
}

export function useEngineActivityDates(
  userId: string,
  range: { from: string; to: string },
) {
  return useQuery({
    queryKey: ["engine_activity_dates", userId, range.from, range.to],
    queryFn: () => fetchEngineActivityDates(userId, range),
    enabled: !!userId,
  });
}
