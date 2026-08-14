import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import { useUpdateHabitStatus } from "@/hooks/useHabitStatus";
import { useUpdateHabitJobs } from "@/hooks/useUpdateHabitJobs";
import type { HabitConfig, HabitStatus } from "@/types/database";
import type { JobOption } from "@/types/setup";

import { JobsConfig } from "./JobsConfig";

type ConfirmingAction = "pause" | "deactivate" | null;

interface JobConfigPanelProps {
  userId: string;
  habitId: string;
  habitName: string;
  currentConfigs: HabitConfig[];
  status: HabitStatus;
  onClose: () => void;
}

export function JobConfigPanel({
  userId,
  habitId,
  habitName,
  currentConfigs,
  status,
  onClose,
}: JobConfigPanelProps) {
  const [confirming, setConfirming] = useState<ConfirmingAction>(null);

  const { mutate: updateJobs, isPending: isSavingJobs } =
    useUpdateHabitJobs(userId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateHabitStatus(userId);

  const currentJobs: JobOption[] = (currentConfigs ?? [])
    .filter((c) => c.key === "job")
    .map((c) => ({ name: c.value, description: c.sub_type ?? "" }));

  const confirmAction = () => {
    if (!confirming) return;
    updateStatus(
      { habitId, status: confirming === "pause" ? "paused" : "deactivated" },
      { onSuccess: onClose },
    );
  };

  return (
    <ScreenWrap>
      <div className="flex items-center gap-3 px-5 pt-[14px]">
        <IconButton
          onClick={onClose}
          ariaLabel="Close"
          className="text-muted shrink-0"
        >
          <ArrowLeft size={18} />
        </IconButton>
        <p className="font-sans text-sm font-medium text-plum">
          {habitName} — jobs
        </p>
      </div>

      <JobsConfig
        values={currentJobs}
        habitName={habitName}
        submitLabel={isSavingJobs ? "Saving…" : "Save"}
        onNext={(jobs) => {
          updateJobs({ habitId, jobs }, { onSuccess: onClose });
        }}
      />

      {(status === "active" || status === "scheduled") && (
        <div className="flex flex-col gap-4 px-8 pb-8">
          <Divider className="my-0" />

          {confirming ? (
            <div className="flex flex-col gap-3">
              <p className="font-sans text-[13px] text-plum">
                {confirming === "pause"
                  ? "Pause this habit?"
                  : "Deactivate this habit?"}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={confirmAction}
                  disabled={isUpdatingStatus}
                  className="font-sans text-[13px] font-medium text-amber bg-transparent border-none cursor-pointer"
                >
                  {isUpdatingStatus ? "…" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="font-sans text-[13px] text-muted bg-transparent border-none cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setConfirming("pause")}
                className="font-sans text-[13px] text-muted text-left bg-transparent border-none cursor-pointer"
              >
                Pause habit
              </button>
              <button
                type="button"
                onClick={() => setConfirming("deactivate")}
                className="font-sans text-[13px] text-amber text-left bg-transparent border-none cursor-pointer"
              >
                Deactivate habit
              </button>
            </div>
          )}
        </div>
      )}
    </ScreenWrap>
  );
}
