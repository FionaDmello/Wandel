import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";

import { ConsistencyDots } from "@/components/ui/ConsistencyDots";
import { useSignupDate } from "@/hooks/useSignupDate";
import { useWeeklyReviewHistory } from "@/hooks/useWeeklyReviewHistory";

import { getOverdueSundays } from "./getOverdueSundays";

interface WeeklyReviewSectionProps {
  userId: string;
}

export function WeeklyReviewSection({ userId }: WeeklyReviewSectionProps) {
  const historyQuery = useWeeklyReviewHistory(userId);
  const signupDate = useSignupDate(userId);

  const allReviews = historyQuery.data ?? [];
  const mostRecentReview = allReviews[0] ?? null;
  const reviewedWeekEndings = allReviews.map((r) => r.week_ending);
  const overdueSundays = getOverdueSundays(
    reviewedWeekEndings,
    signupDate,
    new Date(),
  );

  if (overdueSundays.length > 0) {
    const mostRecentMissed = overdueSundays[0];
    return (
      <div className="bg-card rounded-2xl px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[11px] text-amber uppercase tracking-wider">
            Weekly review
          </p>
          <p className="font-sans text-[11px] text-amber">
            {overdueSundays.length} missed
          </p>
        </div>
        <p className="font-serif text-[18px] text-plum leading-snug">
          {format(parseISO(mostRecentMissed), "d MMM yyyy")} — not reviewed
        </p>
        <Link
          to="/review"
          search={{ weekEnding: mostRecentMissed }}
          className="font-sans text-[13px] text-amber"
        >
          Log it →
        </Link>
      </div>
    );
  }

  if (mostRecentReview) {
    return (
      <div className="bg-card rounded-2xl px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-sans text-[11px] text-violet uppercase tracking-wider">
            Weekly review
          </p>
          <Link to="/review" className="font-sans text-[13px] text-violet">
            View all →
          </Link>
        </div>
        <p className="font-serif italic text-[16px] text-plum">
          {format(parseISO(mostRecentReview.week_ending), "d MMM yyyy")}
        </p>
        {mostRecentReview.self_rated_consistency !== null && (
          <ConsistencyDots rating={mostRecentReview.self_rated_consistency} />
        )}
        {mostRecentReview.engine_response && (
          <p className="font-sans text-[12px] text-muted line-clamp-2">
            {mostRecentReview.engine_response}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          Weekly review
        </p>
        <Link to="/review" className="font-sans text-[13px] text-violet">
          View →
        </Link>
      </div>
      <p className="font-sans text-[13px] text-muted">
        Your weekly reflections will appear here.
      </p>
    </div>
  );
}
