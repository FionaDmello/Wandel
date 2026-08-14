import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import {
  useDeletePractice,
  usePractices,
  useSavePractice,
} from "@/hooks/usePractices";
import type { Practice } from "@/types/engine";

interface PracticeEditorProps {
  userId: string;
  onClose: () => void;
}

export function PracticeEditor({ userId, onClose }: PracticeEditorProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const { data: practices = [] } = usePractices(userId);
  const save = useSavePractice(userId);
  const remove = useDeletePractice(userId);

  function handleToggle(practice: Practice) {
    save.mutate({
      id: practice.id,
      name: practice.name,
      description: practice.description,
      is_default: practice.is_default,
      active: !practice.active,
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
        description: newDescription.trim(),
        is_default: false,
        active: true,
      },
      {
        onSuccess: () => {
          setNewName("");
          setNewDescription("");
        },
      },
    );
  }

  const addDisabled = !newName.trim() || save.isPending;

  return (
    <ProtocolModal title="Your practices" onClose={onClose}>
      <div className="px-6 pt-2 pb-1">
        <p className="font-serif italic text-[18px] text-plum">
          Your practices
        </p>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-8">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="bg-card rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-serif text-[14px] font-semibold text-plum leading-snug">
                {practice.name}
              </span>
              <span className="font-sans text-[11px] text-muted leading-snug">
                {practice.description}
              </span>
            </div>

            {practice.is_default ? (
              <button
                type="button"
                aria-label={
                  practice.active ? "Deactivate practice" : "Activate practice"
                }
                onClick={() => handleToggle(practice)}
                className={`relative w-9 h-5 rounded-full shrink-0 transition-colors ${
                  practice.active ? "bg-amber" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-canvas transition-[left] ${
                    practice.active ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            ) : confirmDeleteId === practice.id ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-sans text-[11px] text-muted">
                  Remove?
                </span>
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(practice.id)}
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
                aria-label="Remove practice"
                onClick={() => setConfirmDeleteId(practice.id)}
                className="text-muted font-sans text-[16px] shrink-0 leading-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <span className="font-sans text-[10px] text-muted uppercase tracking-widest">
            Add a practice
          </span>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            aria-label="Practice name"
            className={`w-full bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
          />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description"
            aria-label="Practice description"
            className={`w-full bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={addDisabled}
            className={`w-full bg-amber text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium transition-opacity ${addDisabled ? "opacity-50" : ""}`}
          >
            Add
          </button>
        </div>
      </div>
    </ProtocolModal>
  );
}
