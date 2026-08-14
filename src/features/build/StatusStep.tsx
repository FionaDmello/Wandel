import { ArrowLeft } from "lucide-react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import type { HabitStatus } from "@/types/database";

interface StatusStepProps {
  onNext: (status: HabitStatus) => void;
  onBack: () => void;
  onCancel: () => void;
  isPending: boolean;
  isError: boolean;
}

export function StatusStep({
  onNext,
  onBack,
  onCancel,
  isPending,
  isError,
}: StatusStepProps) {
  return (
    <ScreenWrap>
      <div className="flex flex-col px-8 py-12 gap-8">
        <IconButton
          onClick={onBack}
          ariaLabel="Back"
          className="self-start text-muted"
        >
          <ArrowLeft size={18} />
        </IconButton>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif italic text-[32px] leading-tight text-plum">
            When do you want to start?
          </h2>
          <p className="font-sans text-xs text-muted">
            You can always change this later.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="accent"
            onClick={() => onNext("active")}
            disabled={isPending}
          >
            Start now
          </Button>
          <Button
            variant="ghost"
            onClick={() => onNext("scheduled")}
            disabled={isPending}
          >
            Schedule for later
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer pt-2"
          >
            Cancel
          </button>
        </div>

        {isError && (
          <p className="font-sans text-xs text-amber">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </ScreenWrap>
  );
}
