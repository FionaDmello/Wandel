import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { DEFAULT_REMINDERS } from "@/constants/defaultReminders";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import type { SetupDraft } from "@/types/setup";

interface RemindersStepProps {
  values: SetupDraft["reminders"];
  onNext: (values: SetupDraft["reminders"]) => void;
}

export function RemindersStep({ values, onNext }: RemindersStepProps) {
  const [reminders, setReminders] = useState<string[]>(
    values.length > 0 ? values : DEFAULT_REMINDERS,
  );
  const [error, setError] = useState<string | null>(null);

  const update = (index: number, value: string) => {
    setError(null);
    setReminders((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const remove = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const add = () => {
    setReminders((prev) => [...prev, ""]);
  };

  const handleSubmit = () => {
    const filled = reminders.filter((r) => r.trim().length > 0);
    if (filled.length === 0) {
      setError("Add at least one reminder.");
      return;
    }
    if (reminders.some((r) => r.trim().length === 0)) {
      setError("Remove or fill in any empty reminders.");
      return;
    }
    onNext(reminders);
  };

  return (
    <div className="flex flex-col min-h-dvh px-8 py-12 gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif italic text-[32px] leading-tight text-plum">
          Kindness reminders
        </h2>
        <p className="font-sans text-xs text-muted">
          Shown on your morning screen, rotating every few days. Edit them to
          make them yours.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {reminders.map((reminder, index) => (
          <div
            key={index}
            className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-violet"
          >
            <textarea
              value={reminder}
              onChange={(e) => update(index, e.target.value)}
              rows={2}
              className={`flex-1 bg-transparent border-none outline-none resize-none font-serif italic ${INPUT_TEXT_SIZE} text-violet leading-snug placeholder:text-muted`}
              placeholder="Write a reminder..."
            />
            {reminders.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-muted bg-transparent border-none cursor-pointer shrink-0 pt-[2px]"
                aria-label="Remove reminder"
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={add}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-transparent text-muted"
        >
          <Plus size={13} strokeWidth={2} />
          <span className="font-sans text-[13px]">Add a reminder</span>
        </button>
      </div>

      {error && <p className="font-sans text-xs text-amber">{error}</p>}

      <Button variant="primary" onClick={handleSubmit}>
        Next
      </Button>
    </div>
  );
}
