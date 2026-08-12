import { useState } from "react";

import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import {
  TAKE_UP_SPACE_QUESTIONS,
  type TakeUpSpaceQuestion,
} from "@/constants/takeUpSpaceQuestions";
import { TakeUpSpaceCategorisationStep } from "@/features/engine/TakeUpSpaceCategorisationStep";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import { useUpdateTakeUpSpaceEntry } from "@/hooks/useTakeUpSpace";
import type { TakeUpSpaceEntry, TakeUpSpaceMode } from "@/types/takeUpSpace";

const TOTAL_STEPS = TAKE_UP_SPACE_QUESTIONS.length;

type Answers = Record<TakeUpSpaceQuestion["field"], string>;

function initialStep(entry: TakeUpSpaceEntry): number {
  const idx = TAKE_UP_SPACE_QUESTIONS.findIndex((q) => entry[q.field] === null);
  return idx === -1 ? TOTAL_STEPS : idx;
}

function initialAnswers(entry: TakeUpSpaceEntry): Answers {
  return Object.fromEntries(
    TAKE_UP_SPACE_QUESTIONS.map((q) => [q.field, entry[q.field] ?? ""]),
  ) as Answers;
}

function resolveText(
  text: string | Record<TakeUpSpaceMode, string>,
  mode: TakeUpSpaceMode,
): string {
  return typeof text === "string" ? text : text[mode];
}

interface TakeUpSpaceLoggerProps {
  userId: string;
  entry: TakeUpSpaceEntry;
  onClose: () => void;
  onComplete: () => void;
}

export function TakeUpSpaceLogger({
  userId,
  entry,
  onClose,
  onComplete,
}: TakeUpSpaceLoggerProps) {
  const [step, setStep] = useState(() => initialStep(entry));
  const [mode, setMode] = useState<TakeUpSpaceMode>(entry.mode);
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(entry));

  const updateEntry = useUpdateTakeUpSpaceEntry(userId);

  const isCategorisationStep = step >= TOTAL_STEPS;
  const question = isCategorisationStep ? null : TAKE_UP_SPACE_QUESTIONS[step];

  function handleAnswerChange(
    field: TakeUpSpaceQuestion["field"],
    value: string,
  ) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  function handleNext() {
    if (!question) return;
    const value = answers[question.field].trim();
    if (!value) return;

    const fieldUpdate: Partial<Record<TakeUpSpaceQuestion["field"], string>> = {
      [question.field]: value,
    };
    updateEntry.mutate(
      { id: entry.id, mode, ...fieldUpdate },
      { onSuccess: () => setStep((s) => s + 1) },
    );
  }

  function handleSkip() {
    updateEntry.mutate(
      { id: entry.id, teaching: "", mode },
      { onSuccess: () => setStep((s) => s + 1) },
    );
  }

  return (
    <ProtocolModal onClose={onClose}>
      <div className="flex justify-center gap-2 px-6 pt-2 pb-1">
        <button
          type="button"
          onClick={() => setMode("in_the_moment")}
          className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
            mode === "in_the_moment"
              ? "bg-rose text-canvas"
              : "bg-card text-muted"
          }`}
        >
          In the moment
        </button>
        <button
          type="button"
          onClick={() => setMode("looking_back")}
          className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
            mode === "looking_back"
              ? "bg-rose text-canvas"
              : "bg-card text-muted"
          }`}
        >
          Looking back
        </button>
      </div>

      {question && (
        <div className="flex flex-col gap-4 px-6 pt-3 pb-8">
          <span className="font-sans text-[10px] text-muted">
            {step + 1} of {TOTAL_STEPS}
          </span>

          <p className="font-sans text-[14px] font-medium text-plum">
            {resolveText(question.question, mode)}
          </p>

          <p className="font-serif italic text-[13px] text-violet">
            {resolveText(question.framing, mode)}
          </p>
          {question.framingLine2 && (
            <p className="font-serif italic text-[13px] text-violet">
              {question.framingLine2}
            </p>
          )}

          <textarea
            value={answers[question.field]}
            onChange={(e) => handleAnswerChange(question.field, e.target.value)}
            rows={4}
            className={`w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum placeholder:text-muted focus:outline-none`}
          />

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="font-sans text-[13px] text-muted"
              >
                Back
              </button>
            ) : (
              <span />
            )}

            {question.optional && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={updateEntry.isPending}
                className="font-sans text-[13px] text-muted disabled:opacity-50"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={
                !answers[question.field].trim() || updateEntry.isPending
              }
              className="bg-rose text-canvas rounded-2xl px-6 py-3 font-sans text-[13px] font-medium disabled:opacity-50"
            >
              {updateEntry.isPending ? "Saving…" : "Next"}
            </button>
          </div>
        </div>
      )}

      {isCategorisationStep && (
        <TakeUpSpaceCategorisationStep
          userId={userId}
          entry={entry}
          mode={mode}
          onBack={() => setStep((s) => s - 1)}
          onComplete={onComplete}
        />
      )}
    </ProtocolModal>
  );
}
