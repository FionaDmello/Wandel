import { Filter, Info, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeader } from "@/features/engine/PanelHeader";
import { PauseOverlay } from "@/features/engine/PauseOverlay";
import { TakeUpSpaceLog } from "@/features/engine/TakeUpSpaceLog";
import { TakeUpSpaceReferenceCard } from "@/features/engine/TakeUpSpaceReferenceCard";
import { TakeUpSpaceTagChips } from "@/features/engine/TakeUpSpaceTagChips";
import { TakeUpSpaceTagEditor } from "@/features/engine/TakeUpSpaceTagEditor";
import { useTakeUpSpaceEntries } from "@/hooks/useTakeUpSpace";
import {
  useSeedDefaultTags,
  useTakeUpSpaceTags,
} from "@/hooks/useTakeUpSpaceTags";

interface PanelTakeUpSpaceProps {
  userId: string;
}

export function PanelTakeUpSpace({ userId }: PanelTakeUpSpaceProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);

  const { data: entries = [] } = useTakeUpSpaceEntries(userId);
  const { data: tags = [], isLoading: tagsLoading } =
    useTakeUpSpaceTags(userId);
  const {
    isPending: seedPending,
    isSuccess: seedSuccess,
    mutate: seedMutate,
  } = useSeedDefaultTags(userId);

  useEffect(() => {
    if (!tagsLoading && tags.length === 0 && !seedPending && !seedSuccess) {
      seedMutate();
    }
  }, [tagsLoading, tags, seedPending, seedSuccess, seedMutate]);

  const pauseVisible = false;

  return (
    <div className="flex flex-col gap-3 bg-card rounded-2xl border-l-[3px] border-l-rose px-5 py-4">
      <PanelHeader
        number={4}
        title="Take Up Space"
        subtitle="Learning to stay with yourself"
        accent="rose"
        action={
          <button
            type="button"
            aria-label="About Take Up Space"
            onClick={() => setReferenceOpen(true)}
            className="text-rose"
          >
            <Info size={14} />
          </button>
        }
      />

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-sans text-[10px] text-muted uppercase tracking-widest">
            Tags
          </span>
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="font-sans text-[11px] text-rose font-medium"
          >
            Edit
          </button>
        </div>
        <TakeUpSpaceTagChips tags={tags} />
      </div>

      {entries.length === 0 && (
        <p className="font-sans text-[12px] text-muted">
          What you notice lives here.
        </p>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          aria-label="Filter entries"
          className="text-muted"
        >
          <Filter size={14} />
        </button>
        <button
          type="button"
          className="bg-rose text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium flex items-center gap-1.5"
        >
          <Plus size={13} /> Notice
        </button>
      </div>

      <TakeUpSpaceLog
        entries={entries}
        onContinueDraft={() => {}}
        onAddToCost={() => {}}
      />

      <PauseOverlay visible={pauseVisible} message="You noticed." />

      {editorOpen && (
        <TakeUpSpaceTagEditor
          userId={userId}
          onClose={() => setEditorOpen(false)}
        />
      )}
      {referenceOpen && (
        <TakeUpSpaceReferenceCard onClose={() => setReferenceOpen(false)} />
      )}
    </div>
  );
}
