import { format } from "date-fns";

import { computeUnreviewedSundays } from "@/hooks/useWeeklyReview";

// Same as computeUnreviewedSundays, but excludes today — a Sunday isn't
// "missed" until it has actually passed.
export function getOverdueSundays(
  reviewedWeekEndings: string[],
  signupDate: Date,
  today: Date,
): string[] {
  const todayStr = format(today, "yyyy-MM-dd");
  return computeUnreviewedSundays(
    reviewedWeekEndings,
    signupDate,
    today,
  ).filter((sunday) => sunday < todayStr);
}
