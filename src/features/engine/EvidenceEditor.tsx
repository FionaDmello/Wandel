import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useAddEvidence } from "@/hooks/useSelfWorthEvidence";

interface EvidenceEditorProps {
  userId: string;
  date: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EvidenceEditor({
  userId,
  date,
  onClose,
  onSuccess,
}: EvidenceEditorProps) {
  const [title, setTitle] = useState("");
  const [situation, setSituation] = useState("");
  const [didWell, setDidWell] = useState("");
  const add = useAddEvidence(userId);

  const isValid =
    title.trim().length > 0 &&
    situation.trim().length > 0 &&
    didWell.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    add.mutate(
      {
        date,
        title: title.trim(),
        situation: situation.trim(),
        what_i_did_well: didWell.trim(),
      },
      { onSuccess },
    );
  }

  return (
    <ProtocolModal title="Evidence" onClose={onClose}>
      <div className="px-6 pt-2 pb-1">
        <p className="font-serif italic text-[18px] text-plum">Evidence</p>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-8">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What would you title this moment?"
          aria-label="Title"
          rows={1}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
        />

        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="What was happening?"
          aria-label="Situation"
          rows={3}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
        />

        <textarea
          value={didWell}
          onChange={(e) => setDidWell(e.target.value)}
          placeholder="What did you actually do well here?"
          aria-label="What you did well"
          rows={3}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || add.isPending}
          className={`w-full bg-teal text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium transition-opacity ${
            !isValid || add.isPending ? "opacity-50" : ""
          }`}
        >
          This is who you are.
        </button>

        <button
          type="button"
          onClick={onClose}
          className="font-sans text-[13px] text-violet text-center mt-1"
        >
          Cancel
        </button>
      </div>
    </ProtocolModal>
  );
}
