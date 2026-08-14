import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";

interface NameStepProps {
  onNext: (name: string) => void;
  onCancel: () => void;
}

export function NameStep({ onNext, onCancel }: NameStepProps) {
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
        <button
          type="button"
          onClick={onCancel}
          className="self-start p-1 text-muted bg-transparent border-none cursor-pointer"
          aria-label="Cancel"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif italic text-[32px] leading-tight text-plum">
            What habit are you building?
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
          placeholder="e.g. Running"
          aria-label="Habit name"
          className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none placeholder:text-muted`}
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
