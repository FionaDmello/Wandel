import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useProfile, useProfileQualities } from "@/hooks/useProfile";
import {
  useLogSlipDrift,
  useRecentEngineDriftCount,
} from "@/hooks/useSlipDriftLog";
import type { PendingProtocol } from "@/types/protocols";

type Phase = 1 | 2 | 3 | 4 | 5;

interface EngineDriftModalProps {
  protocol: PendingProtocol;
  userId: string;
  onDismiss: () => void;
  onComplete: () => void;
}

export function EngineDriftModal({
  protocol,
  userId,
  onDismiss,
  onComplete,
}: EngineDriftModalProps) {
  const [phase, setPhase] = useState<Phase>(1);
  const [freetext, setFreetext] = useState("");
  const [qualityIndex, setQualityIndex] = useState(0);
  const [qualityVisible, setQualityVisible] = useState(false);
  const [forwardThing, setForwardThing] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: qualities = [] } = useProfileQualities(userId);
  const { data: profile } = useProfile(userId);
  const { data: recentDriftCount = 0 } = useRecentEngineDriftCount(userId);

  const { mutateAsync: logSlipDrift } = useLogSlipDrift(userId);

  const currentQuality = qualities[qualityIndex];
  const isLastQuality = qualityIndex >= qualities.length - 1;
  const showCoachingSuggestion = recentDriftCount >= 2;

  useEffect(() => {
    if (phase !== 2) return;
    const frame = requestAnimationFrame(() => setQualityVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      setQualityVisible(false);
    };
  }, [phase, qualityIndex]);

  const advanceFromPhase1 = () => {
    setPhase(qualities.length > 0 ? 2 : 3);
  };

  const handleQualityAdvance = () => {
    if (isLastQuality || qualities.length === 0) {
      setPhase(3);
    } else {
      setQualityIndex((i) => i + 1);
    }
  };

  const handleReturn = async () => {
    setIsSaving(true);
    try {
      await logSlipDrift({
        track_type: "engine",
        type: "drift",
        job_id: null,
        habit_id: null,
        emotional_state_before: freetext.trim() || null,
        protocol_completed: true,
      });
      setPhase(5);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtocolModal
      title={protocol.trackName}
      onClose={onDismiss}
      dismissible={!isSaving}
    >
      <div className="px-6 pt-5 pb-1">
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          {protocol.trackName}
        </p>
      </div>

      {phase === 1 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif text-[22px] leading-snug text-plum">
            You have been away for a while. The engine has been quiet. That is
            okay. It is time to come back.
          </p>

          <textarea
            value={freetext}
            onChange={(e) => setFreetext(e.target.value)}
            rows={2}
            placeholder="What got in the way? (optional)"
            className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum focus:outline-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas resize-none placeholder:text-muted`}
          />

          <Button variant="primary" onClick={advanceFromPhase1}>
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
        <div className="flex flex-col gap-8 px-6 pt-3 pb-12 min-h-[52dvh]">
          <p className="font-sans text-[12px] text-muted leading-relaxed">
            These are not your words yet. They are borrowed truth. Someone who
            knows you wrote them. They are still true even when you have been
            away.
          </p>

          <div className="flex-1 flex items-center justify-center">
            <p
              className={`font-serif font-semibold text-[44px] text-plum text-center leading-none transition-all duration-500 ease-out ${qualityVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
            >
              {currentQuality?.value ?? ""}
            </p>
          </div>

          <Button variant="primary" onClick={handleQualityAdvance}>
            {isLastQuality ? "Continue" : "Next"}
          </Button>
        </div>
      )}

      {phase === 3 && (
        <div className="flex flex-col justify-between gap-8 px-6 pt-3 pb-12 min-h-[44dvh]">
          <p className="font-sans text-[12px] text-muted leading-relaxed">
            Read this out loud if you can. Even quietly. Even if it feels like a
            lie.
          </p>

          <p className="font-serif italic text-[28px] text-plum leading-snug text-center">
            {profile?.why_statement ?? ""}
          </p>

          <Button variant="primary" onClick={() => setPhase(4)}>
            Continue
          </Button>
        </div>
      )}

      {phase === 4 && (
        <div className="flex flex-col gap-8 px-6 pt-3 pb-12">
          <p className="font-serif text-[20px] leading-snug text-plum">
            Come back to your engine today. Not all of it — just one small
            piece. That counts.
          </p>

          <Button
            variant="accent"
            onClick={() => {
              void handleReturn();
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "I am returning."}
          </Button>
        </div>
      )}

      {phase === 5 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif text-[20px] leading-snug text-plum">
            Is there one small thing you can do for yourself today, beyond that?
          </p>

          <textarea
            value={forwardThing}
            onChange={(e) => setForwardThing(e.target.value)}
            rows={3}
            placeholder="Optional."
            className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum focus:outline-none focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas resize-none placeholder:text-muted`}
          />

          {showCoachingSuggestion && (
            <p className="font-sans text-[13px] text-muted leading-relaxed">
              You have come back a few times now. It might be worth bringing
              this to your coach.
            </p>
          )}

          <Button variant="primary" onClick={onComplete}>
            Done
          </Button>
        </div>
      )}
    </ProtocolModal>
  );
}
