import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EMOTIONS } from "@/constants/emotions";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useBreakHabit } from "@/hooks/useBreakHabits";
import { useLogBreakObservation } from "@/hooks/useBreakObservations";
import { useLogSlipDrift } from "@/hooks/useSlipDriftLog";
import type { TrackType } from "@/types/database";

type Phase = 1 | 2 | 3 | 4;
type CauseCategory = "distress_tolerance" | "logistics" | "emotional_load";

export interface HabitSlipContext {
  habitId: string;
  trackType: TrackType;
  trackName: string;
}

interface HabitSlipModalProps {
  habit: HabitSlipContext;
  userId: string;
  onDismiss: () => void;
  onComplete: () => void;
}

export function HabitSlipModal({
  habit,
  userId,
  onDismiss,
  onComplete,
}: HabitSlipModalProps) {
  const isBreak = habit.trackType === "break";

  const [phase, setPhase] = useState<Phase>(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobValue, setSelectedJobValue] = useState<string | null>(null);
  const [selectedCause, setSelectedCause] = useState<CauseCategory | null>(
    null,
  );
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [proudThing, setProudThing] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: breakHabit } = useBreakHabit(
    userId,
    isBreak ? habit.habitId : "",
  );
  const jobConfigs = (breakHabit?.configs ?? []).filter((c) => c.key === "job");

  const { mutateAsync: logBreakObservation } = useLogBreakObservation(userId);
  const { mutateAsync: logSlipDrift } = useLogSlipDrift(userId);

  const toggleEmotion = (e: string) =>
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );

  const selectJob = (id: string, value: string) => {
    if (selectedJobId === id) {
      setSelectedJobId(null);
      setSelectedJobValue(null);
    } else {
      setSelectedJobId(id);
      setSelectedJobValue(value);
    }
  };

  const selectCause = (cause: CauseCategory) => {
    setSelectedCause((prev) => (prev === cause ? null : cause));
  };

  const stageResponse =
    selectedStage === "at_the_slip"
      ? "One slip. The chain is not broken — it has a dot today."
      : selectedStage === "what_is_the_point"
        ? "Is this an accurate reading or a feeling moving fast?"
        : selectedStage === "might_as_well"
          ? "Never-miss-twice rule applied directly."
          : selectedStage === "will_fail_again"
            ? "Shame is not data. The record is data."
            : null;

  const handleComplete = async () => {
    setIsSaving(true);
    const emotionText = selectedEmotions.join(", ") || null;

    try {
      if (isBreak) {
        await Promise.all([
          logBreakObservation({
            habit_id: habit.habitId,
            job: selectedJobValue ?? undefined,
            emotions: [],
          }),
          logSlipDrift({
            track_type: "break",
            type: "slip",
            habit_id: habit.habitId,
            job_id: selectedJobId,
            cause_category: selectedCause,
            emotional_state_before: emotionText,
            all_or_nothing_stage: selectedStage,
            protocol_completed: true,
          }),
        ]);
      } else {
        await logSlipDrift({
          track_type: "build",
          type: "slip",
          habit_id: habit.habitId,
          job_id: null,
          cause_category: selectedCause,
          emotional_state_before: emotionText,
          all_or_nothing_stage: selectedStage,
          protocol_completed: true,
        });
      }
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtocolModal
      title={habit.trackName}
      onClose={onDismiss}
      dismissible={!isSaving}
    >
      <div className="px-6 pt-5 pb-1">
        <p className="font-sans text-[11px] text-muted uppercase tracking-wider">
          {habit.trackName}
        </p>
      </div>

      {phase === 1 && (
        <div className="flex flex-col gap-8 px-6 pt-3 pb-12">
          <p className="font-serif text-[22px] leading-snug text-plum">
            {isBreak
              ? "Finish it fully and consciously. No mid-instance punishment."
              : "Today is behind you. Tomorrow counts."}
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
          {isBreak && jobConfigs.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-sans text-[12px] text-muted">
                What job was it doing?
              </p>
              <div className="flex flex-wrap gap-2">
                {jobConfigs.map((job) => (
                  <Chip
                    key={job.id}
                    label={job.value}
                    selected={selectedJobId === job.id}
                    onToggle={() => selectJob(job.id, job.value)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="font-sans text-[12px] text-muted">
              What was unavailable?
            </p>
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
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-sans text-[12px] text-muted">
              Emotional state before?
            </p>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <Chip
                  key={e}
                  label={e}
                  selected={selectedEmotions.includes(e)}
                  onToggle={() => toggleEmotion(e)}
                />
              ))}
            </div>
          </div>

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
          <p className="font-sans text-[12px] text-muted">
            Where are you right now?
          </p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setSelectedStage("at_the_slip")}
              className={`text-left w-full px-4 py-3 rounded-2xl font-sans text-[13px] cursor-pointer transition-colors duration-100 ${selectedStage === "at_the_slip" ? "bg-transparent border border-plum text-plum font-medium" : "bg-transparent border border-border text-muted font-normal"}`}
            >
              Just this slip
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("what_is_the_point")}
              className={`text-left w-full px-4 py-3 rounded-2xl font-sans text-[13px] cursor-pointer transition-colors duration-100 ${selectedStage === "what_is_the_point" ? "bg-transparent border border-plum text-plum font-medium" : "bg-transparent border border-border text-muted font-normal"}`}
            >
              What is the point?
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("might_as_well")}
              className={`text-left w-full px-4 py-3 rounded-2xl font-sans text-[13px] cursor-pointer transition-colors duration-100 ${selectedStage === "might_as_well" ? "bg-transparent border border-plum text-plum font-medium" : "bg-transparent border border-border text-muted font-normal"}`}
            >
              Might as well go all the way
            </button>
            <button
              type="button"
              onClick={() => setSelectedStage("will_fail_again")}
              className={`text-left w-full px-4 py-3 rounded-2xl font-sans text-[13px] cursor-pointer transition-colors duration-100 ${selectedStage === "will_fail_again" ? "bg-transparent border border-plum text-plum font-medium" : "bg-transparent border border-border text-muted font-normal"}`}
            >
              I will fail again
            </button>
          </div>

          {stageResponse && (
            <p className="font-serif italic text-[18px] text-plum leading-snug">
              {stageResponse}
            </p>
          )}

          <Button
            variant="primary"
            onClick={() => setPhase(4)}
            disabled={!selectedStage}
          >
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

      {phase === 4 && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif text-[20px] leading-snug text-plum">
            What is one small thing I can do today that I will genuinely feel
            proud of?
          </p>

          <textarea
            value={proudThing}
            onChange={(e) => setProudThing(e.target.value)}
            rows={3}
            placeholder="Optional."
            className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none resize-none placeholder:text-muted`}
          />

          <Button
            variant="accent"
            onClick={() => {
              void handleComplete();
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "One slip is weather."}
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
