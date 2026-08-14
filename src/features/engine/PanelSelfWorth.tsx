import { Plus } from "lucide-react";
import { useState } from "react";

import { EvidenceCard } from "@/features/engine/EvidenceCard";
import { EvidenceEditor } from "@/features/engine/EvidenceEditor";
import { PanelHeader } from "@/features/engine/PanelHeader";
import { useSelfWorthEvidence } from "@/hooks/useSelfWorthEvidence";

interface PanelSelfWorthProps {
  userId: string;
  date: string;
}

export function PanelSelfWorth({ userId, date }: PanelSelfWorthProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { data: entries = [] } = useSelfWorthEvidence(userId);

  const displayed =
    showAll || entries.length <= 6 ? entries : entries.slice(0, 6);
  const hasOverflow = entries.length > 6 && !showAll;

  return (
    <div className="flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-teal px-5 py-4">
      <PanelHeader
        number={3}
        title="Self-Worth"
        subtitle="What did today confirm about who you are?"
        accent="teal"
      />

      {entries.length === 0 && (
        <p className="font-sans text-[12px] text-muted">
          Your evidence lives here.
        </p>
      )}

      {displayed.map((entry) => (
        <EvidenceCard
          key={entry.id}
          entry={entry}
          isOpen={openId === entry.id}
          onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
        />
      ))}

      {hasOverflow && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="font-sans text-[12px] text-teal-dark"
        >
          Show all {entries.length} entries
        </button>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="bg-teal text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium flex items-center gap-1.5"
        >
          <Plus size={13} /> Log
        </button>
      </div>

      {editorOpen && (
        <EvidenceEditor
          userId={userId}
          date={date}
          onClose={() => setEditorOpen(false)}
          onSuccess={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
