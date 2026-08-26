import { useQuery } from "@tanstack/react-query";
import { endOfWeek, format, subDays } from "date-fns";

import { WEEKLY_REVIEW_LOOKBACK_WEEKS } from "@/constants/weeklyReview";
import { supabase } from "@/lib/supabase";
import type { WeeklyReview } from "@/types/database";

export function currentWeekEnding(today: Date = new Date()): string {
  return format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

// Most recent Sunday ≤ today (today itself when today is Sunday)
export function mostRecentSunday(today: Date = new Date()): string {
  return format(subDays(today, today.getDay()), "yyyy-MM-dd");
}

// Most-recent-first, bounded below by signupDate (never surfaces Sundays
// before the account existed) and above by today.
export function computeUnreviewedSundays(
  reviewedWeekEndings: string[],
  signupDate: Date,
  today: Date,
  maxWeeks: number = WEEKLY_REVIEW_LOOKBACK_WEEKS,
): string[] {
  const results: string[] = [];
  const startDate = subDays(today, today.getDay());
  const signupDateStr = format(signupDate, "yyyy-MM-dd");
  for (let i = 0; i < maxWeeks; i++) {
    const sunday = subDays(startDate, i * 7);
    const dateStr = format(sunday, "yyyy-MM-dd");
    if (dateStr < signupDateStr) break;
    if (!reviewedWeekEndings.includes(dateStr)) {
      results.push(dateStr);
    }
  }
  return results;
}

export function useWeeklyReview(userId: string, date?: Date) {
  const weekEnding = currentWeekEnding(date);

  return useQuery({
    queryKey: ["weekly_review", userId, weekEnding],
    queryFn: async (): Promise<WeeklyReview | null> => {
      const { data, error } = await supabase
        .from("weekly_reviews")
        .select("*")
        .eq("user_id", userId)
        .eq("week_ending", weekEnding)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
