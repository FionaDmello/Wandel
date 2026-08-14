import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { useAddBreakHabit } from "@/hooks/useBreakHabits";
import type { HabitStatus } from "@/types/database";
import type { JobOption } from "@/types/setup";

import { JobsConfig } from "./JobsConfig";

interface NameStepProps {
  onNext: (name: string) => void;
  onCancel: () => void;
}

function NameStep({ onNext, onCancel }: NameStepProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Give this habit a name.");
      return;
    }
    onNext(trimmed);
  };

  return (
    <ScreenWrap>
      <div className="flex flex-col px-8 py-12 gap-8">
        <IconButton
          onClick={onCancel}
          ariaLabel="Cancel"
          className="self-start text-muted"
        >
          <ArrowLeft size={18} />
        </IconButton>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif italic text-[32px] leading-tight text-plum">
            What habit are you working to break?
          </h2>
          <p className="font-sans text-xs text-muted">Give it a name.</p>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          placeholder="e.g. Nail biting"
          className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum focus:outline-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas placeholder:text-muted`}
          autoFocus
        />

        {error && <p className="font-sans text-xs text-amber">{error}</p>}

        <Button variant="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </ScreenWrap>
  );
}

interface AddHabitFlowProps {
  userId: string;
  onCancel: () => void;
  onComplete: () => void;
}

export function AddHabitFlow({
  userId,
  onCancel,
  onComplete,
}: AddHabitFlowProps) {
  const [step, setStep] = useState(0);
  const [habitName, setHabitName] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<JobOption[]>([]);
  const { mutate: addHabit, isPending, isError } = useAddBreakHabit(userId);

  const save = (status: HabitStatus) => {
    addHabit(
      { name: habitName, jobs: selectedJobs, status },
      { onSuccess: onComplete },
    );
  };

  if (step === 0) {
    return (
      <NameStep
        onNext={(name) => {
          setHabitName(name);
          setStep(1);
        }}
        onCancel={onCancel}
      />
    );
  }

  if (step === 1) {
    return (
      <ScreenWrap>
        <JobsConfig
          values={[]}
          habitName={habitName}
          submitLabel="Next"
          onNext={(jobs) => {
            setSelectedJobs(jobs);
            setStep(2);
          }}
          onCancel={onCancel}
        />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="flex flex-col px-8 py-12 gap-8">
        <IconButton
          onClick={() => setStep(1)}
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
            onClick={() => save("active")}
            disabled={isPending}
          >
            Start now
          </Button>
          <Button
            variant="ghost"
            onClick={() => save("scheduled")}
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
