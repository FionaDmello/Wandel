import { Link, useSearch } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Divider } from "@/components/ui/Divider";
import { useBreakHabits } from "@/hooks/useBreakHabits";
import { useBuildHabits } from "@/hooks/useBuildHabits";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { useAllStandingUpEntries } from "@/hooks/useStandingUpLog";
import { useWeeklyConsistency } from "@/hooks/useWeeklyConsistency";
import { computeUnreviewedSundays } from "@/hooks/useWeeklyReview";
import { useWeeklyReviewHistory } from "@/hooks/useWeeklyReviewHistory";

import { ReviewHistoryRecord } from "./ReviewHistoryRecord";
import { ReviewStepper } from "./ReviewStepper";

function ReviewContent({ userId }: { userId: string }) {
  const { weekEnding: paramWeekEnding } = useSearch({ from: "/review" });
  const [expandedWeekEnding, setExpandedWeekEnding] = useState<string | null>(
    paramWeekEnding ?? null,
  );
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );

  const breakHabitsQuery = useBreakHabits(userId);
  const buildHabitsQuery = useBuildHabits(userId);
  const historyQuery = useWeeklyReviewHistory(userId);
  const standingUpQuery = useAllStandingUpEntries(userId);
  const profileQuery = useProfile(userId);

  const breakHabits = (breakHabitsQuery.data ?? []).filter(
    (h) => h.status === "active",
  );
  const buildHabits = (buildHabitsQuery.data ?? []).filter(
    (h) => h.status === "active",
  );
  const allHabits = [...breakHabits, ...buildHabits];
  const allReviews = historyQuery.data ?? [];
  const standingUpEntries = standingUpQuery.data ?? [];

  const reviewedWeekEndings = allReviews.map((r) => r.week_ending);
  // Until the profile loads, assume no history predates today — avoids a
  // flash of stray unreviewed Sundays before the real signup date is known.
  const signupDate = profileQuery.data
    ? parseISO(profileQuery.data.created_at)
    : new Date();
  const unreviewedSundays = computeUnreviewedSundays(
    reviewedWeekEndings,
    signupDate,
    new Date(),
  );

  const expandedHistoryReview =
    allReviews.find((r) => r.id === expandedHistoryId) ?? null;

  const historyConsistencyQuery = useWeeklyConsistency(
    userId,
    expandedHistoryReview?.week_ending ?? "",
  );

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-safe-bar pb-12 gap-8">
        <div className="flex items-center justify-between">
          <Link to="/engine" className="font-sans text-sm text-plum">
            ← Engine
          </Link>
          <p className="font-serif italic text-lg text-plum">Weekly review</p>
        </div>

        {unreviewedSundays.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="font-sans text-[11px] text-amber uppercase tracking-wider">
              To review
            </p>
            {unreviewedSundays.map((weekEnding) => (
              <div key={weekEnding} className="flex flex-col">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedWeekEnding(
                      expandedWeekEnding === weekEnding ? null : weekEnding,
                    )
                  }
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                    <div className="flex flex-col items-start gap-0.5">
                      <p className="font-sans text-sm text-plum">
                        {format(parseISO(weekEnding), "d MMM yyyy")}
                      </p>
                      <p className="font-sans text-xs text-muted">
                        Not yet reviewed
                      </p>
                    </div>
                  </div>
                  <p className="font-sans text-sm text-amber">→</p>
                </button>

                {expandedWeekEnding === weekEnding && (
                  <div className="border-l-2 border-amber ml-[0.1875rem] pl-5">
                    <ReviewStepper
                      userId={userId}
                      weekEnding={weekEnding}
                      breakHabits={breakHabits}
                      buildHabits={buildHabits}
                      standingUpEntries={standingUpEntries}
                      onComplete={() => setExpandedWeekEnding(null)}
                      onCancel={() => setExpandedWeekEnding(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {unreviewedSundays.length > 0 && allReviews.length > 0 && (
          <Divider className="my-0" />
        )}

        {allReviews.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-[11px] text-violet uppercase tracking-wider">
              Past reviews
            </p>
            {allReviews.map((review) => (
              <ReviewHistoryRecord
                key={review.id}
                review={review}
                habits={allHabits}
                isExpanded={expandedHistoryId === review.id}
                consistencyData={
                  expandedHistoryId === review.id
                    ? historyConsistencyQuery.data
                    : undefined
                }
                onToggle={() =>
                  setExpandedHistoryId(
                    expandedHistoryId === review.id ? null : review.id,
                  )
                }
              />
            ))}
          </div>
        )}

        {historyQuery.isLoading && (
          <p className="font-sans text-xs text-muted">Loading…</p>
        )}
      </div>
    </ScreenWrap>
  );
}

export function ReviewScreen() {
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";

  if (loading || !userId) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Loading…</p>
        </div>
      </ScreenWrap>
    );
  }

  return <ReviewContent userId={userId} />;
}
