import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { TAKE_UP_SPACE_QUESTIONS } from "@/constants/takeUpSpaceQuestions";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useUpdateCostField } from "@/hooks/useTakeUpSpace";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

interface TakeUpSpaceCostEditorProps {
  userId: string;
  entry: TakeUpSpaceEntry;
  onClose: () => void;
}

const costQuestion = TAKE_UP_SPACE_QUESTIONS.find((q) => q.field === "cost");
const questionText =
  costQuestion && typeof costQuestion.question === "string"
    ? costQuestion.question
    : null;
const framingText =
  costQuestion && typeof costQuestion.framing === "string"
    ? costQuestion.framing
    : null;

export function TakeUpSpaceCostEditor({
  userId,
  entry,
  onClose,
}: TakeUpSpaceCostEditorProps) {
  const [cost, setCost] = useState(() => entry.cost ?? "");
  const updateCost = useUpdateCostField(userId);

  function handleSave() {
    const trimmed = cost.trim();
    if (!trimmed) return;
    updateCost.mutate({ id: entry.id, cost: trimmed }, { onSuccess: onClose });
  }

  return (
    <ProtocolModal onClose={onClose}>
      <div className="flex flex-col gap-4 px-6 pt-3 pb-8">
        {questionText && (
          <p className="font-sans text-[14px] font-medium text-plum">
            {questionText}
          </p>
        )}
        {framingText && (
          <p className="font-serif italic text-[13px] text-violet">
            {framingText}
          </p>
        )}

        <textarea
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          rows={4}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none`}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!cost.trim() || updateCost.isPending}
          className="bg-rose text-canvas rounded-2xl px-6 py-3 font-sans text-[13px] font-medium disabled:opacity-50"
        >
          {updateCost.isPending ? "Saving…" : "Save"}
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
