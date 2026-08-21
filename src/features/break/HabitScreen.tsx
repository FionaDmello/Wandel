import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import { BreakJournal } from "@/features/break/BreakJournal";
import { HabitSlipModal } from "@/features/protocols/HabitSlipModal";
import { useBreakHabit } from "@/hooks/useBreakHabits";
import {
  useResetBreakHabit,
  useUpdateHabitStatus,
} from "@/hooks/useHabitStatus";
import { useSession } from "@/hooks/useSession";
import type { HabitWithConfigs } from "@/types/database";

import { JobConfigPanel } from "./JobConfigPanel";
import { PausedBanner } from "./PausedBanner";

interface HabitContentProps {
  userId: string;
  habit: HabitWithConfigs;
}

function HabitContent({ userId, habit }: HabitContentProps) {
  const [showJobConfig, setShowJobConfig] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { date?: string };

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateHabitStatus(userId);
  const { mutate: resetHabit, isPending: isResetting } =
    useResetBreakHabit(userId);

  const isPending = isUpdatingStatus || isResetting;

  if (showJobConfig) {
    return (
      <JobConfigPanel
        userId={userId}
        habitId={habit.id}
        habitName={habit.name}
        currentConfigs={habit.configs}
        status={habit.status}
        onClose={() => setShowJobConfig(false)}
      />
    );
  }

  return (
    <ScreenWrap>
      <div className="flex flex-col px-6 pt-6 gap-6">
        <div className="flex items-center justify-between">
          <IconButton
            onClick={() => navigate({ to: "/break" })}
            ariaLabel="Back"
            className="text-muted"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="font-sans text-sm font-medium text-plum">
            {habit.name}
          </h1>
          <IconButton
            onClick={() => setShowJobConfig(true)}
            ariaLabel="Configure jobs"
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
                className="bg-teal text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium border-none cursor-pointer"
              >
                I slipped
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/break/$habitId/log",
                    params: { habitId: habit.id },
                    search: { date: search.date },
                  })
                }
                className="bg-teal text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium border-none cursor-pointer"
              >
                Log an urge
              </button>
            </div>

            <Divider className="my-0" />

            <div className="flex flex-col gap-3">
              <p className="font-serif italic text-[16px] text-plum leading-snug">
                Your log
              </p>
              <BreakJournal
                userId={userId}
                habitId={habit.id}
                configs={habit.configs ?? []}
              />
            </div>
          </>
        )}

        {showSlipModal && (
          <HabitSlipModal
            habit={{
              habitId: habit.id,
              trackType: "break",
              trackName: habit.name,
            }}
            userId={userId}
            onDismiss={() => setShowSlipModal(false)}
            onComplete={() => setShowSlipModal(false)}
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

        {habit.status === "scheduled" && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="bg-card rounded-2xl border-l-[3px] border-violet px-4 py-4">
              <p className="font-serif italic text-[15px] text-plum leading-snug">
                This habit is scheduled but not yet active.
              </p>
            </div>
            <Button
              variant="accent"
              onClick={() =>
                updateStatus({ habitId: habit.id, status: "active" })
              }
              disabled={isPending}
            >
              Start tracking
            </Button>
          </div>
        )}

        {habit.status === "deactivated" && (
          <div className="flex flex-col gap-5 pt-4">
            <p className="font-serif italic text-[18px] text-muted leading-snug">
              This habit has been deactivated.
            </p>
            <p className="font-sans text-[12px] text-muted">
              Your past observations are still visible in the History tab.
            </p>
            {confirmingReset ? (
              <div className="flex flex-col gap-2">
                <p className="font-sans text-[13px] text-plum">
                  Reset this habit?
                </p>
                <p className="font-sans text-[11px] text-muted">
                  All observations will be permanently deleted.
                </p>
                <div className="flex gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => resetHabit(habit.id)}
                    disabled={isPending}
                    className="font-sans text-[13px] font-medium text-amber bg-transparent border-none cursor-pointer"
                  >
                    {isPending ? "…" : "Yes, reset"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(false)}
                    className="font-sans text-[13px] text-muted bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="font-sans text-[13px] text-muted text-left bg-transparent border-none cursor-pointer"
              >
                Reset habit
              </button>
            )}
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}

export function HabitScreen() {
  const { habitId } = useParams({ strict: false });
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

  return <HabitContent userId={userId} habit={habitQuery.data} />;
}
