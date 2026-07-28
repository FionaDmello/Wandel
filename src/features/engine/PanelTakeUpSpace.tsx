import { Filter, Info, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { PanelHeader } from "@/features/engine/PanelHeader";
import { TakeUpSpaceLog } from "@/features/engine/TakeUpSpaceLog";
import { TakeUpSpaceLogger } from "@/features/engine/TakeUpSpaceLogger";
import { TakeUpSpaceReferenceCard } from "@/features/engine/TakeUpSpaceReferenceCard";
import { TakeUpSpaceTagChips } from "@/features/engine/TakeUpSpaceTagChips";
import { TakeUpSpaceTagEditor } from "@/features/engine/TakeUpSpaceTagEditor";
import {
  useAbandonDraft,
  useActiveDraft,
  useCreateTakeUpSpaceEntry,
  useTakeUpSpaceEntries,
} from "@/hooks/useTakeUpSpace";
import {
  useSeedDefaultTags,
  useTakeUpSpaceTags,
} from "@/hooks/useTakeUpSpaceTags";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

interface PanelTakeUpSpaceProps {
  userId: string;
  date: string;
}

export function PanelTakeUpSpace({ userId, date }: PanelTakeUpSpaceProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TakeUpSpaceEntry | null>(null);

  const { data: entries = [] } = useTakeUpSpaceEntries(userId);
  const { data: draft } = useActiveDraft(userId);
  const { data: tags = [], isLoading: tagsLoading } =
    useTakeUpSpaceTags(userId);
  const {
    isPending: seedPending,
    isSuccess: seedSuccess,
    mutate: seedMutate,
  } = useSeedDefaultTags(userId);
  const createEntry = useCreateTakeUpSpaceEntry(userId);
  const abandonDraft = useAbandonDraft(userId);

  useEffect(() => {
    if (!tagsLoading && tags.length === 0 && !seedPending && !seedSuccess) {
      seedMutate();
    }
  }, [tagsLoading, tags, seedPending, seedSuccess, seedMutate]);

  const discardPending = abandonDraft.isPending || createEntry.isPending;

  function handleDiscard() {
    if (!draft) return;
    abandonDraft.mutate(draft.id, {
      onSuccess: () => {
        createEntry.mutate({ date }, { onSuccess: setActiveEntry });
      },
    });
  }

  function handleLogComplete() {
    setActiveEntry(null);
  }

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

      {draft && (
        <div className="flex flex-col gap-2 bg-canvas rounded-2xl px-4 py-3">
          <p className="font-serif italic text-[13px] text-violet">
            You have an entry in progress.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={discardPending}
              onClick={() => setActiveEntry(draft)}
              className="font-sans text-[12px] text-plum font-medium disabled:opacity-50"
            >
              Continue
            </button>
            <button
              type="button"
              disabled={discardPending}
              onClick={handleDiscard}
              className="font-sans text-[12px] text-muted disabled:opacity-50"
            >
              {discardPending ? "Discarding…" : "Discard"}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          aria-label="Filter entries"
          className="text-muted"
        >
          <Filter size={14} />
        </button>
        {!draft && (
          <button
            type="button"
            disabled={createEntry.isPending}
            onClick={() =>
              createEntry.mutate({ date }, { onSuccess: setActiveEntry })
            }
            className="bg-rose text-canvas rounded-full px-4 py-2 font-sans text-[12px] font-medium flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={13} /> Notice
          </button>
        )}
      </div>

      <TakeUpSpaceLog
        entries={entries}
        onContinueDraft={() => {}}
        onAddToCost={() => {}}
      />

      {editorOpen && (
        <TakeUpSpaceTagEditor
          userId={userId}
          onClose={() => setEditorOpen(false)}
        />
      )}
      {referenceOpen && (
        <TakeUpSpaceReferenceCard onClose={() => setReferenceOpen(false)} />
      )}
      {activeEntry && (
        <TakeUpSpaceLogger
          userId={userId}
          entry={activeEntry}
          onClose={() => setActiveEntry(null)}
          onComplete={handleLogComplete}
        />
      )}
    </div>
  );
}
