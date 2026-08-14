import { Check } from "lucide-react";
import { useRef, useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import {
  useDailyIntention,
  useUpsertDailyIntention,
} from "@/hooks/useDailyIntention";

interface TodayIntentionFieldProps {
  userId: string;
  date: string;
}

export function TodayIntentionField({
  userId,
  date,
}: TodayIntentionFieldProps) {
  const { data: intention } = useDailyIntention(userId, date);
  const upsert = useUpsertDailyIntention(userId);

  const serverValue = intention?.hard_task ?? "";
  const [local, setLocal] = useState(serverValue);
  const [prevServerValue, setPrevServerValue] = useState(serverValue);
  const [showSaved, setShowSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (prevServerValue !== serverValue) {
    setPrevServerValue(serverValue);
    setLocal(serverValue);
  }

  const isDirty = local !== serverValue;

  function save() {
    if (!isDirty) return;
    upsert.mutate(
      { date, hard_task: local.trim() || null },
      {
        onSuccess: () => {
          setShowSaved(true);
          if (savedTimer.current) clearTimeout(savedTimer.current);
          savedTimer.current = setTimeout(() => setShowSaved(false), 1200);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={save}
          placeholder="What do you want to show up for today?"
          aria-label="Today's intention"
          rows={2}
          className={`w-full resize-none bg-canvas rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
        />
        {isDirty && (
          <button
            type="button"
            onClick={save}
            aria-label="Save intention"
            className="absolute bottom-2 right-3 text-muted"
          >
            <Check size={14} />
          </button>
        )}
      </div>
      {showSaved && (
        <span className="font-sans text-[11px] italic text-muted px-1">
          Saved.
        </span>
      )}
    </div>
  );
}
