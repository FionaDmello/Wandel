import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { DateSelector } from "@/components/ui/DateSelector";
import { PausedBanner } from "@/features/break/PausedBanner";
import { HabitSlipModal } from "@/features/protocols/HabitSlipModal";
import { useBuildHabit } from "@/hooks/useBuildHabits";
import {
  useResetBuildHabit,
  useUpdateHabitStatus,
} from "@/hooks/useHabitStatus";
import { useSession } from "@/hooks/useSession";
import type { HabitWithConfigs } from "@/types/database";

import { BuildConfigPanel } from "./BuildConfigPanel";
import { BuildLogForm } from "./BuildLogForm";
import { DeactivatedState } from "./DeactivatedState";
import { ScheduledState } from "./ScheduledState";

interface BuildHabitContentProps {
  userId: string;
  habit: HabitWithConfigs;
  logDate?: string;
}

function BuildHabitContent({
  userId,
  habit,
  logDate: initialLogDate,
}: BuildHabitContentProps) {
  const [logDate, setLogDate] = useState(
    initialLogDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [showConfig, setShowConfig] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const navigate = useNavigate();

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateHabitStatus(userId);
  const { mutate: resetHabit, isPending: isResetting } =
    useResetBuildHabit(userId);

  const isPending = isUpdatingStatus || isResetting;

  if (showConfig) {
    return (
      <BuildConfigPanel
        userId={userId}
        habitId={habit.id}
        habitName={habit.name}
        configs={habit.configs ?? []}
        status={habit.status}
        onClose={() => setShowConfig(false)}
      />
    );
  }

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-6 gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate({ to: "/build" })}
            className="p-1 text-muted bg-transparent border-none cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-sans text-sm font-medium text-plum">
            {habit.name}
          </h1>
          <button
            type="button"
            onClick={() => setShowConfig(true)}
            className="p-1 text-muted bg-transparent border-none cursor-pointer"
            aria-label="Configure habit"
          >
            <Settings size={18} />
          </button>
        </div>

        {habit.status === "active" && (
          <>
            <DateSelector value={logDate} onChange={setLogDate} />
            <BuildLogForm
              userId={userId}
              habitId={habit.id}
              habitName={habit.name}
              configs={habit.configs ?? []}
              date={logDate}
            />
            <button
              type="button"
              onClick={() => setShowSlipModal(true)}
              className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer pb-2"
            >
              I slipped
            </button>
          </>
        )}

        {showSlipModal && (
          <HabitSlipModal
            habit={{
              habitId: habit.id,
              trackType: "build",
              trackName: habit.name,
            }}
            userId={userId}
            onDismiss={() => setShowSlipModal(false)}
            onComplete={() => setShowSlipModal(false)}
          />
        )}

        {habit.status === "scheduled" && (
          <ScheduledState
            isPending={isPending}
            onStart={() =>
              updateStatus({ habitId: habit.id, status: "active" })
            }
          />
        )}

        {habit.status === "paused" && habit.paused_at && (
          <PausedBanner
            pausedAt={habit.paused_at}
            isPending={isPending}
            onResume={() =>
              updateStatus({ habitId: habit.id, status: "active" })
            }
            onReset={() => resetHabit(habit.id)}
            onDeactivate={() =>
              updateStatus({ habitId: habit.id, status: "deactivated" })
            }
          />
        )}

        {habit.status === "deactivated" && (
          <DeactivatedState
            isPending={isPending}
            onReset={() => resetHabit(habit.id)}
          />
        )}
      </div>
    </ScreenWrap>
  );
}

export function BuildHabitScreen() {
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
    <BuildHabitContent
      userId={userId}
      habit={habitQuery.data}
      logDate={search.date}
    />
  );
}
