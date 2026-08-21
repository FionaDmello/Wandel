import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import { PausedBanner } from "@/features/break/PausedBanner";
import { BuildJournal } from "@/features/build/BuildJournal";
import { HabitSlipModal } from "@/features/protocols/HabitSlipModal";
import { useBuildHabit } from "@/hooks/useBuildHabits";
import {
  useResetBuildHabit,
  useUpdateHabitStatus,
} from "@/hooks/useHabitStatus";
import { useSession } from "@/hooks/useSession";
import type { HabitWithConfigs } from "@/types/database";

import { BuildConfigPanel } from "./BuildConfigPanel";
import { DeactivatedState } from "./DeactivatedState";
import { ScheduledState } from "./ScheduledState";

interface BuildHabitContentProps {
  userId: string;
  habit: HabitWithConfigs;
}

function BuildHabitContent({ userId, habit }: BuildHabitContentProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { date?: string };

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
          <IconButton
            onClick={() => navigate({ to: "/build" })}
            ariaLabel="Back"
            className="text-muted"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="font-sans text-sm font-medium text-plum">
            {habit.name}
          </h1>
          <IconButton
            onClick={() => setShowConfig(true)}
            ariaLabel="Configure habit"
            className="text-muted"
          >
            <Settings size={18} />
          </IconButton>
        </div>

        {habit.status === "active" && (
          <>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                className="bg-amber text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium border-none cursor-pointer"
              >
                I slipped
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/build/$habitId/log",
                    params: { habitId: habit.id },
                    search: { date: search.date },
                  })
                }
                className="bg-amber text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium border-none cursor-pointer"
              >
                Log today's effort
              </button>
            </div>

            <Divider className="my-0" />

            <div className="flex flex-col gap-3">
              <p className="font-serif italic text-[16px] text-plum leading-snug">
                Your log
              </p>
              <BuildJournal userId={userId} habitId={habit.id} />
            </div>
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

  return <BuildHabitContent userId={userId} habit={habitQuery.data} />;
}
