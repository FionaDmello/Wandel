import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { PanelSlider } from "@/features/engine/PanelSlider";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useLogHardThing } from "@/hooks/useHardThings";

interface HardThingLoggerProps {
  userId: string;
  date: string;
  initialWhat: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function HardThingLogger({
  userId,
  date,
  initialWhat,
  onClose,
  onSuccess,
}: HardThingLoggerProps) {
  const [what, setWhat] = useState(initialWhat ?? "");
  const [before, setBefore] = useState(1);
  const [during, setDuring] = useState(1);
  const [after, setAfter] = useState(1);
  const [note, setNote] = useState("");
  const log = useLogHardThing(userId);

  const isValid = what.trim().length > 0;
  const linkedIntention =
    initialWhat !== null && what.trim() === initialWhat.trim();

  function handleSubmit() {
    if (!isValid) return;
    log.mutate(
      {
        date,
        what: what.trim(),
        before,
        during,
        after,
        note: note.trim() || null,
        linked_intention: linkedIntention,
      },
      { onSuccess },
    );
  }

  return (
    <ProtocolModal onClose={onClose}>
      <div className="px-6 pt-2 pb-1">
        <p className="font-serif italic text-[18px] text-plum">
          Log a hard thing
        </p>
      </div>

      <div className="flex flex-col gap-5 px-6 pb-8">
        <textarea
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="What did you show up for?"
          rows={2}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none`}
        />

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
            Before
          </span>
          <PanelSlider
            value={before}
            onChange={setBefore}
            anchorLow="Calm"
            anchorHigh="Dreading it"
            accent="violet"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
            During
          </span>
          <PanelSlider
            value={during}
            onChange={setDuring}
            anchorLow="Easy"
            anchorHigh="Overwhelming"
            accent="violet"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[11px] text-muted uppercase tracking-widest">
            After
          </span>
          <PanelSlider
            value={after}
            onChange={setAfter}
            anchorLow="Relieved"
            anchorHigh="Still hard"
            accent="violet"
          />
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What made this hard — and what stays with you?"
          rows={3}
          className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none`}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || log.isPending}
          className={`w-full bg-violet text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium transition-opacity ${
            !isValid || log.isPending ? "opacity-50" : ""
          }`}
        >
          I did this
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
