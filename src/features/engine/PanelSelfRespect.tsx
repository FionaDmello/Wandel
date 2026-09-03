import { Plus } from "lucide-react";
import { useState } from "react";

import { HardThingCard } from "@/features/engine/HardThingCard";
import { HardThingLogger } from "@/features/engine/HardThingLogger";
import { PanelHeader } from "@/features/engine/PanelHeader";
import { PauseOverlay } from "@/features/engine/PauseOverlay";
import { TodayIntentionField } from "@/features/engine/TodayIntentionField";
import { useDailyIntention } from "@/hooks/useDailyIntention";
import { useHardThings } from "@/hooks/useHardThings";

interface PanelSelfRespectProps {
  userId: string;
  date: string;
}

export function PanelSelfRespect({ userId, date }: PanelSelfRespectProps) {
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);

  const { data: entries = [] } = useHardThings(userId);
  const { data: intention } = useDailyIntention(userId, date);

  const displayed = entries.slice(0, 5);
  const overflow = entries.length - 5;

  function handleLogSuccess() {
    setLoggerOpen(false);
    setPauseVisible(true);
    setTimeout(() => setPauseVisible(false), 1400);
  }

  return (
    <div
      data-tour="panel-self-respect"
      className="relative flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-violet px-5 py-4"
    >
      <PanelHeader
        number={1}
        title="Self-Respect"
        subtitle="What hard thing did you do today?"
        accent="violet"
      />

      <TodayIntentionField userId={userId} date={date} />

      {displayed.map((entry) => (
        <HardThingCard key={entry.id} entry={entry} />
      ))}

      {overflow > 0 && (
        <p className="font-sans text-[11px] text-muted text-center">
          + {overflow} more {overflow === 1 ? "entry" : "entries"}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setLoggerOpen(true)}
          className="bg-violet text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium flex items-center gap-1.5"
        >
          <Plus size={13} /> Log
        </button>
      </div>

      <PauseOverlay visible={pauseVisible} />

      {loggerOpen && (
        <HardThingLogger
          userId={userId}
          date={date}
          initialWhat={intention?.hard_task ?? null}
          onClose={() => setLoggerOpen(false)}
          onSuccess={handleLogSuccess}
        />
      )}
    </div>
  );
}
