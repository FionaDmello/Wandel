import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { PanelSlider } from "@/features/engine/PanelSlider";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { usePractices } from "@/hooks/usePractices";
import { useLogSelfLove } from "@/hooks/useSelfLove";
import type { Practice } from "@/types/engine";

interface SelfLoveLoggerProps {
  userId: string;
  date: string;
  initialPractice: Practice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function SelfLoveLogger({
  userId,
  date,
  initialPractice,
  onClose,
  onSuccess,
}: SelfLoveLoggerProps) {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(
    initialPractice,
  );
  const [felt, setFelt] = useState(1);
  const [note, setNote] = useState("");

  const { data: practices = [] } = usePractices(userId);
  const active = practices.filter((p) => p.active);
  const log = useLogSelfLove(userId);

  const isValid = selectedPractice !== null;

  function handleSubmit() {
    if (!isValid) return;
    log.mutate(
      {
        date,
        practice: selectedPractice.name,
        practice_id: selectedPractice.id,
        felt,
        note: note.trim() || null,
      },
      { onSuccess },
    );
  }

  return (
    <ProtocolModal title="A moment of care" onClose={onClose}>
      <div className="px-6 pt-2 pb-1">
        <p className="font-serif italic text-[18px] text-plum">
          A moment of care
        </p>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-8">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
            Practice
          </span>
          <div className="flex flex-wrap gap-2">
            {active.map((practice) => (
              <button
                key={practice.id}
                type="button"
                onClick={() => setSelectedPractice(practice)}
                className={`rounded-full px-4 py-2 font-sans text-[12px] font-medium ${
                  selectedPractice?.id === practice.id
                    ? "bg-amber text-canvas"
                    : "bg-card text-plum shadow-sm"
                }`}
              >
                {practice.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
            Felt
          </span>
          <PanelSlider
            value={felt}
            onChange={setFelt}
            anchorLow="Adrift"
            anchorHigh="Present"
            accent="amber"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What did this bring up?"
          aria-label="Note"
          rows={3}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas`}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || log.isPending}
          className={`w-full bg-amber text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium transition-opacity ${
            !isValid || log.isPending ? "opacity-50" : ""
          }`}
        >
          That was for me
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
