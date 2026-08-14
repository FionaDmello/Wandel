import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { DateSelector } from "@/components/ui/DateSelector";
import { IconButton } from "@/components/ui/IconButton";
import { useBreakHabit } from "@/hooks/useBreakHabits";
import { useSession } from "@/hooks/useSession";
import type { HabitWithConfigs } from "@/types/database";

import { LogForm } from "./LogForm";

interface BreakLogContentProps {
  userId: string;
  habit: HabitWithConfigs;
  logDate?: string;
  entryId?: string;
}

function BreakLogContent({
  userId,
  habit,
  logDate: initialLogDate,
  entryId,
}: BreakLogContentProps) {
  const [logDate, setLogDate] = useState(
    initialLogDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const navigate = useNavigate();

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-6 gap-6">
        <div className="flex items-center justify-between">
          <IconButton
            onClick={() =>
              navigate({
                to: "/break/$habitId",
                params: { habitId: habit.id },
              })
            }
            ariaLabel="Back"
            className="text-muted"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="font-sans text-sm font-medium text-plum">
            {habit.name}
          </h1>
          <div className="w-[34px]" />
        </div>

        {habit.status === "active" ? (
          <>
            <DateSelector value={logDate} onChange={setLogDate} />
            <LogForm
              userId={userId}
              habitId={habit.id}
              jobConfigs={habit.configs}
              date={logDate}
              entryId={entryId}
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

export function BreakLogScreen() {
  const { habitId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as {
    date?: string;
    entryId?: string;
  };
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";
  const habitQuery = useBreakHabit(userId, habitId ?? "");

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
    <BreakLogContent
      userId={userId}
      habit={habitQuery.data}
      logDate={search.date}
      entryId={search.entryId}
    />
  );
}
