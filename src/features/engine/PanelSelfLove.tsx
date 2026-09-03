import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeader } from "@/features/engine/PanelHeader";
import { PracticeChips } from "@/features/engine/PracticeChips";
import { PracticeEditor } from "@/features/engine/PracticeEditor";
import { SelfLoveCard } from "@/features/engine/SelfLoveCard";
import { SelfLoveLogger } from "@/features/engine/SelfLoveLogger";
import { usePractices, useSeedDefaultPractices } from "@/hooks/usePractices";
import { useSelfLoveEntries } from "@/hooks/useSelfLove";
import type { Practice } from "@/types/engine";

interface PanelSelfLoveProps {
  userId: string;
  date: string;
}

export function PanelSelfLove({ userId, date }: PanelSelfLoveProps) {
  const [loggerOpen, setLoggerOpen] = useState(false);
  const [loggerPractice, setLoggerPractice] = useState<Practice | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const { data: entries = [] } = useSelfLoveEntries(userId);
  const { data: practices } = usePractices(userId);
  const {
    isPending: seedPending,
    isSuccess: seedSuccess,
    mutate: seedMutate,
  } = useSeedDefaultPractices(userId);

  useEffect(() => {
    if (
      practices !== undefined &&
      practices.length === 0 &&
      !seedPending &&
      !seedSuccess
    ) {
      seedMutate();
    }
  }, [practices, seedPending, seedSuccess, seedMutate]);

  const displayed = entries.slice(0, 4);
  const overflow = entries.length - 4;

  return (
    <div
      data-tour="panel-self-love"
      className="flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-amber px-5 py-4"
    >
      <PanelHeader
        number={2}
        title="Self-Love"
        subtitle="What did you give yourself today?"
        accent="amber"
      />

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-sans text-[10px] text-muted uppercase tracking-widest">
            Practices
          </span>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="font-sans text-[11px] text-amber font-medium"
          >
            Edit
          </button>
        </div>
        <PracticeChips
          userId={userId}
          onSelect={(p) => {
            setLoggerPractice(p);
            setLoggerOpen(true);
          }}
        />
      </div>

      {displayed.map((entry) => (
        <SelfLoveCard key={entry.id} entry={entry} />
      ))}

      {overflow > 0 && (
        <p className="font-sans text-[11px] text-muted text-center">
          + {overflow} more {overflow === 1 ? "entry" : "entries"}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setLoggerPractice(null);
            setLoggerOpen(true);
          }}
          className="bg-amber text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium flex items-center gap-1.5"
        >
          <Plus size={13} /> Log
        </button>
      </div>

      {loggerOpen && (
        <SelfLoveLogger
          userId={userId}
          date={date}
          initialPractice={loggerPractice}
          onClose={() => setLoggerOpen(false)}
          onSuccess={() => setLoggerOpen(false)}
        />
      )}

      {editorOpen && (
        <PracticeEditor userId={userId} onClose={() => setEditorOpen(false)} />
      )}
    </div>
  );
}
