import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DEFAULT_QUALITIES } from "@/constants/defaultQualities";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import type { SetupDraft } from "@/types/setup";

interface QualitiesStepProps {
  values: SetupDraft["qualities"];
  onNext: (values: SetupDraft["qualities"]) => void;
}

export function QualitiesStep({ values, onNext }: QualitiesStepProps) {
  const [selected, setSelected] = useState<string[]>(values);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = (quality: string) => {
    setError(null);
    setSelected((prev) =>
      prev.includes(quality)
        ? prev.filter((q) => q !== quality)
        : [...prev, quality],
    );
  };

  const confirmCustom = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setShowInput(false);
      setInputValue("");
      return;
    }
    if (!selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
    }
    setInputValue("");
    setShowInput(false);
  };

  const handleAddClick = () => {
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError("Select at least one quality.");
      return;
    }
    onNext(selected);
  };

  const customQualities = selected.filter(
    (q) => !DEFAULT_QUALITIES.includes(q),
  );

  return (
    <div className="flex flex-col justify-center min-h-dvh px-8 gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif italic text-[32px] leading-tight text-plum">
          Your qualities
        </h2>
        <p className="font-sans text-xs text-muted">
          The traits you're growing into. Tap to select.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEFAULT_QUALITIES.map((quality) => (
          <Chip
            key={quality}
            label={quality}
            selected={selected.includes(quality)}
            onToggle={() => toggle(quality)}
          />
        ))}

        {customQualities.map((quality) => (
          <Chip
            key={quality}
            label={quality}
            selected
            onToggle={() => toggle(quality)}
          />
        ))}

        {showInput ? (
          <div className="inline-flex items-center gap-1 min-h-[34px] px-3 py-[6px] rounded-[20px] bg-amber border border-[0.5px] border-amber">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCustom();
                }
                if (e.key === "Escape") {
                  setShowInput(false);
                  setInputValue("");
                }
              }}
              onBlur={confirmCustom}
              placeholder="Type a quality"
              aria-label="New quality"
              className={`bg-transparent border-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas font-sans ${INPUT_TEXT_SIZE} text-canvas placeholder:text-canvas/60 w-24`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddClick}
            aria-label="Add custom quality"
            className="inline-flex items-center justify-center min-h-[34px] w-[34px] rounded-[20px] border border-[0.5px] border-border bg-canvas text-muted cursor-pointer"
          >
            <Plus size={13} strokeWidth={2} />
          </button>
        )}
      </div>

      {error && <p className="font-sans text-xs text-amber">{error}</p>}

      <Button variant="primary" onClick={handleSubmit}>
        Next
      </Button>
    </div>
  );
}
