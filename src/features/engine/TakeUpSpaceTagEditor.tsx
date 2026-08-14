import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import {
  useDeleteTag,
  useSaveTags,
  useTakeUpSpaceTags,
} from "@/hooks/useTakeUpSpaceTags";
import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

interface TakeUpSpaceTagEditorProps {
  userId: string;
  onClose: () => void;
}

export function TakeUpSpaceTagEditor({
  userId,
  onClose,
}: TakeUpSpaceTagEditorProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const { data: tags = [] } = useTakeUpSpaceTags(userId);
  const save = useSaveTags(userId);
  const remove = useDeleteTag(userId);

  function handleToggle(tag: TakeUpSpaceTag) {
    save.mutate({
      id: tag.id,
      name: tag.name,
      is_default: tag.is_default,
      active: !tag.active,
    });
  }

  function handleConfirmDelete(id: string) {
    remove.mutate(id, { onSuccess: () => setConfirmDeleteId(null) });
  }

  function handleAdd() {
    if (!newName.trim()) return;
    save.mutate(
      {
        id: crypto.randomUUID(),
        name: newName.trim(),
        is_default: false,
        active: true,
      },
      { onSuccess: () => setNewName("") },
    );
  }

  const isDuplicate = tags.some(
    (t) => t.name.trim().toLowerCase() === newName.trim().toLowerCase(),
  );
  const addDisabled = !newName.trim() || isDuplicate || save.isPending;

  return (
    <ProtocolModal title="Your tags" onClose={onClose}>
      <div className="px-6 pt-2 pb-1">
        <p className="font-serif italic text-[18px] text-plum">Your tags</p>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-8">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <span className="font-sans text-[13px] text-plum">{tag.name}</span>

            {tag.is_default ? (
              <button
                type="button"
                aria-label={tag.active ? "Deactivate tag" : "Activate tag"}
                onClick={() => handleToggle(tag)}
                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${
                  tag.active ? "bg-rose" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-canvas transition-[left] ${
                    tag.active ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            ) : confirmDeleteId === tag.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-sans text-[11px] text-muted">
                  Remove?
                </span>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(tag.id)}
                  className="font-sans text-[11px] text-plum font-medium"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="font-sans text-[11px] text-muted"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Remove tag"
                onClick={() => setConfirmDeleteId(tag.id)}
                className="text-muted font-sans text-[16px] shrink-0 leading-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <span className="font-sans text-[10px] text-muted uppercase tracking-widest">
            Add a tag
          </span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name"
            className={`w-full bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
          />
          {isDuplicate && newName.trim() && (
            <span className="font-sans text-[11px] text-muted">
              A tag with this name already exists
            </span>
          )}
          <button
            type="button"
            onClick={handleAdd}
            disabled={addDisabled}
            className={`w-full bg-rose text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium transition-opacity ${
              addDisabled ? "opacity-50" : ""
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </ProtocolModal>
  );
}
