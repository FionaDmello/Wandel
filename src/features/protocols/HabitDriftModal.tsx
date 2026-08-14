import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useBuildHabit } from "@/hooks/useBuildHabits";
import type { PendingProtocol } from "@/types/protocols";

type Phase = 1 | 2 | 3;
type CauseCategory = "distress_tolerance" | "logistics" | "emotional_load";

interface HabitDriftModalProps {
  protocol: PendingProtocol;
  userId: string;
  onDismiss: () => void;
  onComplete: () => void;
}

export function HabitDriftModal({
  protocol,
  userId,
  onDismiss,
  onComplete,
}: HabitDriftModalProps) {
  const isBreak = protocol.trackType === "break";
  const driftDays = protocol.driftDays ?? 2;

  const [phase, setPhase] = useState<Phase>(1);
  const [selectedCause, setSelectedCause] = useState<CauseCategory | null>(
    null,
  );

  const { data: buildHabit } = useBuildHabit(
    userId,
    !isBreak ? (protocol.habitId ?? "") : "",
  );

  const buildConfigs = buildHabit?.configs ?? [];
  const nonNegConfig =
    buildConfigs.find(
      (c) => c.key === "non_negotiable" && c.sub_type === null,
    ) ?? buildConfigs.find((c) => c.key === "non_negotiable");

  const causeAdjustment =
    selectedCause === "distress_tolerance"
      ? "Start with the smallest possible version. Just that."
      : selectedCause === "logistics"
        ? "Remove one friction point before the next attempt."
        : selectedCause === "emotional_load"
          ? "One thing, not everything. The minimum counts."
          : null;

  const selectCause = (cause: CauseCategory) => {
    setSelectedCause((prev) => (prev === cause ? null : cause));
  };

  return (
    <ProtocolModal title={protocol.trackName} onClose={onDismiss}>
      <div className="px-6 pt-5 pb-1">
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          {protocol.trackName}
        </p>
      </div>

      {phase === 1 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif text-[22px] leading-snug text-plum">
            You drifted for {driftDays} {driftDays === 1 ? "day" : "days"}. That
            happened.
          </p>

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
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-sans text-[12px] text-muted">What gave way?</p>

          <div className="flex flex-wrap gap-2">
            <Chip
              label="Distress tolerance"
              selected={selectedCause === "distress_tolerance"}
              onToggle={() => selectCause("distress_tolerance")}
            />
            <Chip
              label="Logistics"
              selected={selectedCause === "logistics"}
              onToggle={() => selectCause("logistics")}
            />
            <Chip
              label="Emotional load"
              selected={selectedCause === "emotional_load"}
              onToggle={() => selectCause("emotional_load")}
            />
          </div>

          {causeAdjustment && (
            <p className="font-serif italic text-[18px] text-plum leading-snug">
              {causeAdjustment}
            </p>
          )}

          <Button variant="primary" onClick={() => setPhase(3)}>
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

      {phase === 3 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          {isBreak ? (
            <p className="font-serif text-[20px] leading-snug text-plum">
              Return to awareness. That is enough for today.
            </p>
          ) : (
            <>
              {nonNegConfig && (
                <div className="bg-card rounded-2xl px-4 py-3">
                  <p className="font-sans text-[11px] text-muted uppercase tracking-wider mb-1">
                    Today, just this
                  </p>
                  <p className="font-sans text-[13px] text-plum">
                    {nonNegConfig.value}
                  </p>
                </div>
              )}
              <p className="font-sans text-[13px] text-muted leading-relaxed">
                Return at the minimum, not with a grand recommitment.
              </p>
            </>
          )}

          <Button variant="accent" onClick={onComplete}>
            I am returning.
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
    </ProtocolModal>
  );
}
