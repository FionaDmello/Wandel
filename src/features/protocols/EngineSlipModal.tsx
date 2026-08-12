import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useProfileQualities } from "@/hooks/useProfile";
import { useLogSlipDrift } from "@/hooks/useSlipDriftLog";
import type { PendingProtocol } from "@/types/protocols";

type Phase = 1 | 2 | 3;

interface EngineSlipModalProps {
  protocol: PendingProtocol;
  userId: string;
  onDismiss: () => void;
  onComplete: () => void;
}

export function EngineSlipModal({
  protocol,
  userId,
  onDismiss,
  onComplete,
}: EngineSlipModalProps) {
  const [phase, setPhase] = useState<Phase>(1);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [freetext, setFreetext] = useState("");
  const [qualityVisible, setQualityVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: qualities = [] } = useProfileQualities(userId);
  const quality = qualities[0]?.value ?? "You";

  const { mutateAsync: logSlipDrift } = useLogSlipDrift(userId);

  useEffect(() => {
    if (phase !== 2) return;
    const frame = requestAnimationFrame(() => setQualityVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  };

  const handleComplete = async () => {
    setIsSaving(true);
    const parts = [...selectedChips, freetext.trim()].filter(Boolean);
    const emotionText = parts.length > 0 ? parts.join("\n") : null;

    try {
      await logSlipDrift({
        track_type: "engine",
        type: "slip",
        job_id: null,
        habit_id: null,
        cause_category: null,
        emotional_state_before: emotionText,
        protocol_completed: true,
      });
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtocolModal onClose={onDismiss} dismissible={!isSaving}>
      <div className="px-6 pt-5 pb-1">
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          {protocol.trackName}
        </p>
      </div>

      {phase === 1 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif text-[22px] leading-snug text-plum">
            Hey. You have not shown up for a few days.
          </p>

          <div className="flex flex-wrap gap-2">
            <Chip
              label="Life got heavy"
              selected={selectedChips.includes("Life got heavy")}
              onToggle={() => toggleChip("Life got heavy")}
            />
            <Chip
              label="I forgot"
              selected={selectedChips.includes("I forgot")}
              onToggle={() => toggleChip("I forgot")}
            />
            <Chip
              label="It felt too hard"
              selected={selectedChips.includes("It felt too hard")}
              onToggle={() => toggleChip("It felt too hard")}
            />
          </div>

          <textarea
            value={freetext}
            onChange={(e) => setFreetext(e.target.value)}
            rows={2}
            placeholder="Anything else? (optional)"
            className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none resize-none placeholder:text-muted`}
          />

          <Button variant="primary" onClick={() => setPhase(2)}>
            Continue
          </Button>

          <button
            type="button"
            onClick={onDismiss}
            className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      )}

      {phase === 2 && (
        <div className="flex flex-col items-center justify-center gap-10 px-6 pt-3 pb-12 min-h-[44dvh]">
          <p
            className={`font-serif font-semibold text-[44px] text-plum text-center leading-none transition-all duration-500 ease-out ${qualityVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
          >
            {quality}
          </p>

          <Button variant="primary" onClick={() => setPhase(3)}>
            I see it.
          </Button>
        </div>
      )}

      {phase === 3 && (
        <div className="flex flex-col items-center gap-4 px-6 pt-10 pb-12">
          <p className="font-serif italic text-[24px] text-plum">
            One word today.
          </p>
          <p className="font-sans text-[16px] text-violet">That is enough.</p>

          <div className="w-full mt-4">
            <Button
              variant="accent"
              onClick={() => {
                void handleComplete();
              }}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "I showed up."}
            </Button>
          </div>
        </div>
      )}
    </ProtocolModal>
  );
}
