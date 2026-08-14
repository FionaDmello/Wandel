import { Check, Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { DEFAULT_JOBS } from "@/constants/defaultJobs";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import type { JobOption } from "@/types/setup";

interface JobsConfigProps {
  values: JobOption[];
  onNext: (values: JobOption[]) => void;
  habitName?: string;
  submitLabel?: string;
  onCancel?: () => void;
}

export function JobsConfig({
  values,
  onNext,
  habitName = "this habit",
  submitLabel = "Next",
  onCancel,
}: JobsConfigProps) {
  const [selected, setSelected] = useState<JobOption[]>(values);
  const [showInput, setShowInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const isSelected = (name: string) => selected.some((j) => j.name === name);

  const toggle = (job: JobOption) => {
    setError(null);
    setSelected((prev) =>
      prev.some((j) => j.name === job.name)
        ? prev.filter((j) => j.name !== job.name)
        : [...prev, job],
    );
  };

  const confirmCustom = () => {
    const name = customName.trim();
    const description = customDescription.trim();
    if (!name || !description) {
      setInputError("Both fields are required.");
      return;
    }
    if (!selected.some((j) => j.name === name)) {
      setSelected((prev) => [...prev, { name, description }]);
    }
    setCustomName("");
    setCustomDescription("");
    setInputError(null);
    setShowInput(false);
  };

  const handleAddClick = () => {
    setShowInput(true);
    setTimeout(() => nameRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      setError("Select at least one job.");
      return;
    }
    onNext(selected);
  };

  const defaultNames = DEFAULT_JOBS.map((j) => j.name);
  const customJobs = selected.filter((j) => !defaultNames.includes(j.name));

  return (
    <div className="flex flex-col px-8 py-12 gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif italic text-[32px] leading-tight text-plum">
          What jobs does {habitName} do for you?
        </h2>
        <p className="font-sans text-xs text-muted">
          Select the ones that ring true.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {DEFAULT_JOBS.map((job) => (
          <button
            key={job.name}
            type="button"
            onClick={() => toggle(job)}
            className={`flex items-center justify-between gap-3 w-full text-left px-4 py-3 rounded-2xl bg-card transition-all duration-100 border-l-[3px] ${
              isSelected(job.name) ? "border-amber" : "border-transparent"
            }`}
          >
            <div className="flex flex-col gap-[2px]">
              <span className="font-sans text-[13px] font-medium text-plum">
                {job.name}
              </span>
              <span className="font-sans text-[11px] text-muted">
                {job.description}
              </span>
            </div>
            {isSelected(job.name) && (
              <Check
                size={15}
                strokeWidth={2.5}
                className="text-amber shrink-0"
              />
            )}
          </button>
        ))}

        {customJobs.map((job) => (
          <button
            key={job.name}
            type="button"
            onClick={() => toggle(job)}
            className="flex items-center justify-between gap-3 w-full text-left px-4 py-3 rounded-2xl bg-card border-l-[3px] border-amber"
          >
            <div className="flex flex-col gap-[2px]">
              <span className="font-sans text-[13px] font-medium text-plum">
                {job.name}
              </span>
              <span className="font-sans text-[11px] text-muted">
                {job.description}
              </span>
            </div>
            <Check
              size={15}
              strokeWidth={2.5}
              className="text-amber shrink-0"
            />
          </button>
        ))}

        {showInput ? (
          <div className="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-border">
            <input
              ref={nameRef}
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setShowInput(false)}
              placeholder="Job name"
              className={`bg-transparent border-none outline-none font-sans ${INPUT_TEXT_SIZE} font-medium text-plum placeholder:text-muted`}
            />
            <div className="h-[0.5px] bg-soft" />
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmCustom();
                }
                if (e.key === "Escape") setShowInput(false);
              }}
              placeholder="Short description"
              className={`bg-transparent border-none outline-none font-sans ${INPUT_TEXT_SIZE} text-muted placeholder:text-muted`}
            />
            {inputError && (
              <p className="font-sans text-[11px] text-amber">{inputError}</p>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowInput(false);
                  setCustomName("");
                  setCustomDescription("");
                  setInputError(null);
                }}
                className="font-sans text-[11px] text-muted bg-transparent border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCustom}
                className="font-sans text-[11px] font-medium text-amber bg-transparent border-none cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-transparent text-plum"
          >
            <Plus size={13} strokeWidth={2} />
            <span className="font-sans text-[13px]">Add your own</span>
          </button>
        )}
      </div>

      {error && <p className="font-sans text-xs text-amber">{error}</p>}

      <Button variant="primary" onClick={handleSubmit}>
        {submitLabel}
      </Button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
