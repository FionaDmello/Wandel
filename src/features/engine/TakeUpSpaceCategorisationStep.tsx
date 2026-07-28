import { useState } from "react";

import {
  OUTCOME_OPTIONS,
  PANEL_TAG_OPTIONS,
} from "@/constants/takeUpSpacePanelOptions";
import { TakeUpSpaceTagSelector } from "@/features/engine/TakeUpSpaceTagSelector";
import { useCompleteEntry } from "@/hooks/useTakeUpSpace";
import { useTakeUpSpaceTags } from "@/hooks/useTakeUpSpaceTags";
import type {
  TakeUpSpaceEntry,
  TakeUpSpaceMode,
  TakeUpSpaceOutcome,
  TakeUpSpacePanelTag,
} from "@/types/takeUpSpace";

interface TakeUpSpaceCategorisationStepProps {
  userId: string;
  entry: TakeUpSpaceEntry;
  mode: TakeUpSpaceMode;
  onBack: () => void;
  onComplete: () => void;
}

export function TakeUpSpaceCategorisationStep({
  userId,
  entry,
  mode,
  onBack,
  onComplete,
}: TakeUpSpaceCategorisationStepProps) {
  const [choiceOutcome, setChoiceOutcome] = useState<TakeUpSpaceOutcome | null>(
    () => entry.choice_outcome,
  );
  const [panelTag, setPanelTag] = useState<TakeUpSpacePanelTag | null>(
    () => entry.panel_tag,
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    () => entry.tag_ids,
  );

  const { data: tags = [] } = useTakeUpSpaceTags(userId);
  const completeEntry = useCompleteEntry(userId);

  function toggleOutcome(value: TakeUpSpaceOutcome) {
    setChoiceOutcome((prev) => (prev === value ? null : value));
  }

  function togglePanelTag(value: TakeUpSpacePanelTag) {
    setPanelTag((prev) => (prev === value ? null : value));
  }

  function toggleTag(id: string) {
    setSelectedTagIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id],
    );
  }

  function handleDone() {
    if (choiceOutcome === null) return;
    const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));
    completeEntry.mutate(
      {
        id: entry.id,
        mode,
        choice_outcome: choiceOutcome,
        panel_tag: panelTag,
        tag_ids: selectedTags.map((t) => t.id),
        tag_names: selectedTags.map((t) => t.name),
      },
      { onSuccess: onComplete },
    );
  }

  return (
    <div className="flex flex-col gap-5 px-6 pt-3 pb-8">
      <div className="flex flex-col gap-2">
        <span className="font-sans text-[9px] font-medium text-rose uppercase tracking-widest">
          What happened
        </span>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={choiceOutcome === option.value}
              onClick={() => toggleOutcome(option.value)}
              className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
                choiceOutcome === option.value
                  ? "bg-rose text-canvas"
                  : "bg-card text-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-[9px] font-medium text-rose uppercase tracking-widest">
          Where this belongs
        </span>
        <div className="flex flex-wrap gap-2">
          {PANEL_TAG_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={panelTag === option.value}
              onClick={() => togglePanelTag(option.value)}
              className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
                panelTag === option.value
                  ? "bg-rose text-canvas"
                  : "bg-card text-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-sans text-[9px] font-medium text-rose uppercase tracking-widest">
          Tags
        </span>
        <TakeUpSpaceTagSelector
          tags={tags}
          selectedIds={selectedTagIds}
          onToggle={toggleTag}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="font-sans text-[13px] text-muted"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={choiceOutcome === null || completeEntry.isPending}
          className="bg-rose text-canvas rounded-2xl px-6 py-3 font-sans text-[13px] font-medium disabled:opacity-50"
        >
          {completeEntry.isPending ? "Saving…" : "Done"}
        </button>
      </div>
    </div>
  );
}
