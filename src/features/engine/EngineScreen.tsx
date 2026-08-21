import { format, isSunday } from "date-fns";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { DateSelector } from "@/components/ui/DateSelector";
import { AmbientLayer } from "@/features/engine/AmbientLayer";
import { PanelSelfLove } from "@/features/engine/PanelSelfLove";
import { PanelSelfRespect } from "@/features/engine/PanelSelfRespect";
import { PanelSelfWorth } from "@/features/engine/PanelSelfWorth";
import { PanelTakeUpSpace } from "@/features/engine/PanelTakeUpSpace";
import { WeeklyReviewPrompt } from "@/features/engine/WeeklyReviewPrompt";
import { useDateSearchParam } from "@/hooks/useDateSearchParam";
import { useSession } from "@/hooks/useSession";
import { mostRecentSunday } from "@/hooks/useWeeklyReview";
import { useWeeklyReviewHistory } from "@/hooks/useWeeklyReviewHistory";

interface EngineContentProps {
  userId: string;
  initialLogDate: string;
}

function EngineContent({ userId, initialLogDate }: EngineContentProps) {
  const [logDate, setLogDate] = useState(initialLogDate);

  const reviewHistoryQuery = useWeeklyReviewHistory(userId);
  const isSundayToday = isSunday(new Date());
  const mostRecentSundayStr = mostRecentSunday();
  const mostRecentReview = reviewHistoryQuery.data?.[0] ?? null;
  const isCurrentWeekReviewed =
    mostRecentReview?.week_ending === mostRecentSundayStr;

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-6 gap-6 relative">
        <AmbientLayer userId={userId} />
        <DateSelector value={logDate} onChange={setLogDate} />
        <PanelSelfRespect userId={userId} date={logDate} />
        <PanelSelfLove userId={userId} date={logDate} />
        <PanelSelfWorth userId={userId} date={logDate} />
        <PanelTakeUpSpace userId={userId} date={logDate} />
        <WeeklyReviewPrompt
          mostRecentReview={mostRecentReview}
          isSundayToday={isSundayToday}
          isCurrentWeekReviewed={isCurrentWeekReviewed}
          mostRecentSundayStr={mostRecentSundayStr}
        />
      </div>
    </ScreenWrap>
  );
}

export function EngineScreen() {
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";
  const date = useDateSearchParam();
  const initialLogDate = date ?? format(new Date(), "yyyy-MM-dd");

  if (loading || !userId) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Loading...</p>
        </div>
      </ScreenWrap>
    );
  }

  return <EngineContent userId={userId} initialLogDate={initialLogDate} />;
}
