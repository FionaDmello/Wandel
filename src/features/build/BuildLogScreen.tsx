import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { DateSelector } from "@/components/ui/DateSelector";
import { useBuildHabit } from "@/hooks/useBuildHabits";
import { useSession } from "@/hooks/useSession";
import type { HabitWithConfigs } from "@/types/database";

import { BuildLogForm } from "./BuildLogForm";

interface BuildLogContentProps {
  userId: string;
  habit: HabitWithConfigs;
  logDate?: string;
}

function BuildLogContent({
  userId,
  habit,
  logDate: initialLogDate,
}: BuildLogContentProps) {
  const [logDate, setLogDate] = useState(
    initialLogDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const navigate = useNavigate();

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-6 gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/build/$habitId",
                params: { habitId: habit.id },
              })
            }
            className="p-1 text-muted bg-transparent border-none cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-sans text-sm font-medium text-plum">
            {habit.name}
          </h1>
          <div className="w-[26px]" />
        </div>

        {habit.status === "active" ? (
          <>
            <DateSelector value={logDate} onChange={setLogDate} />
            <BuildLogForm
              userId={userId}
              habitId={habit.id}
              habitName={habit.name}
              configs={habit.configs ?? []}
              date={logDate}
            />
          </>
        ) : (
          <p className="font-sans text-[13px] text-muted">
            This habit isn't active right now.
          </p>
        )}
      </div>
    </ScreenWrap>
  );
}

export function BuildLogScreen() {
  const { habitId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { date?: string };
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";
  const habitQuery = useBuildHabit(userId, habitId ?? "");

  if (loading || !userId || habitQuery.isLoading) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Loading...</p>
        </div>
      </ScreenWrap>
    );
  }

  if (!habitQuery.data) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Habit not found.</p>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <BuildLogContent
      userId={userId}
      habit={habitQuery.data}
      logDate={search.date}
    />
  );
}
