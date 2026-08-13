import { format } from "date-fns";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { useBreakHabits } from "@/hooks/useBreakHabits";
import { useBuildHabits } from "@/hooks/useBuildHabits";
import {
  useMonthBreakObservations,
  useMonthBuildObservations,
  useMonthEngineActivity,
} from "@/hooks/useMonthData";
import { useSession } from "@/hooks/useSession";
import { useAllStandingUpEntries } from "@/hooks/useStandingUpLog";
import { useSyncBreakStandingUp } from "@/hooks/useSyncBreakStandingUp";
import type { StandingUpEntry } from "@/types/database";

import { CalendarGrid } from "./CalendarGrid";
import { DaySheet } from "./DaySheet";
import { MonthNav } from "./MonthNav";
import { StandingUpSection } from "./StandingUpSection";

interface HistoryContentProps {
  userId: string;
}

function HistoryContent({ userId }: HistoryContentProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const engineActivityQuery = useMonthEngineActivity(userId, year, month);
  const breakObsQuery = useMonthBreakObservations(userId, year, month);
  const buildObsQuery = useMonthBuildObservations(userId, year, month);
  const breakHabitsQuery = useBreakHabits(userId);
  const buildHabitsQuery = useBuildHabits(userId);
  const allStandingUpQuery = useAllStandingUpEntries(userId);
  useSyncBreakStandingUp(userId);

  const engineActivitySet = new Set(engineActivityQuery.data ?? []);
  const breakObs = breakObsQuery.data ?? [];
  const buildObs = buildObsQuery.data ?? [];
  const breakHabits = breakHabitsQuery.data ?? [];
  const buildHabits = buildHabitsQuery.data ?? [];
  const allStandingUp = allStandingUpQuery.data ?? [];

  const engineStandingUp = allStandingUp.filter(
    (e) => e.track_type === "engine",
  );

  const activeHabitIds = new Set([
    ...breakHabits.map((h) => h.id),
    ...buildHabits.map((h) => h.id),
  ]);

  type HabitGroup = {
    habitId: string;
    trackName: string;
    entries: StandingUpEntry[];
  };
  const habitGroupMap = new Map<string, HabitGroup>();
  for (const entry of allStandingUp) {
    if (!entry.habit_id) continue;
    if (!habitGroupMap.has(entry.habit_id)) {
      habitGroupMap.set(entry.habit_id, {
        habitId: entry.habit_id,
        trackName: entry.track_name,
        entries: [],
      });
    }
    habitGroupMap.get(entry.habit_id)!.entries.push(entry);
  }
  const habitGroups = [...habitGroupMap.values()].sort((a, b) => {
    const aRank = activeHabitIds.has(a.habitId) ? 0 : 1;
    const bRank = activeHabitIds.has(b.habitId) ? 0 : 1;
    return aRank - bRank;
  });

  const today = format(new Date(), "yyyy-MM-dd");
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const goToPrev = () => {
    if (month === 1) {
      setYear((y: number) => y - 1);
      setMonth(12);
    } else setMonth((m: number) => m - 1);
  };

  const goToNext = () => {
    if (year === currentYear && month === currentMonth) return;
    if (month === 12) {
      setYear((y: number) => y + 1);
      setMonth(1);
    } else setMonth((m: number) => m + 1);
  };

  const hasEngineActivity = selectedDate
    ? engineActivitySet.has(selectedDate)
    : false;

  const selectedBreakObs = selectedDate
    ? breakObs.filter((o) => o.logged_at.slice(0, 10) === selectedDate)
    : [];

  const selectedBuildObs = selectedDate
    ? buildObs.filter((o) => o.date === selectedDate)
    : [];

  const isFuture = !!selectedDate && selectedDate > today;

  return (
    <ScreenWrap>
      <MonthNav year={year} month={month} onPrev={goToPrev} onNext={goToNext} />

      <CalendarGrid
        year={year}
        month={month}
        engineActivityDates={engineActivityQuery.data ?? []}
        breakHabits={breakHabits}
        breakObs={breakObs}
        buildObs={buildObs}
        onDayTap={setSelectedDate}
      />

      <div className="flex items-center justify-center gap-4 px-4 pt-2 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-blue" />
          <span className="font-sans text-[10px] text-muted">Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-teal" />
          <span className="font-sans text-[10px] text-muted">Break</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-[5px] h-[5px] rounded-full bg-amber" />
          <span className="font-sans text-[10px] text-muted">Build</span>
        </div>
      </div>

      {(engineStandingUp.length > 0 || habitGroups.length > 0) && (
        <div className="flex flex-col gap-1 px-2 pt-2 pb-1">
          <StandingUpSection trackName="Mirror" entries={engineStandingUp} />
          {habitGroups.map((group) => (
            <StandingUpSection
              key={group.habitId}
              trackName={group.trackName}
              entries={group.entries}
            />
          ))}
        </div>
      )}

      {selectedDate && (
        <DaySheet
          date={selectedDate}
          hasEngineActivity={hasEngineActivity}
          breakObs={selectedBreakObs}
          buildObs={selectedBuildObs}
          breakHabits={breakHabits}
          buildHabits={buildHabits}
          isFuture={isFuture}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </ScreenWrap>
  );
}

export function HistoryScreen() {
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";

  if (loading || !userId) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Loading...</p>
        </div>
      </ScreenWrap>
    );
  }

  return <HistoryContent userId={userId} />;
}
