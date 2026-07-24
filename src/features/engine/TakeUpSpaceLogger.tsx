import { useState } from "react";

import {
  TAKE_UP_SPACE_QUESTIONS,
  type TakeUpSpaceQuestion,
} from "@/constants/takeUpSpaceQuestions";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import type { TakeUpSpaceMode } from "@/types/takeUpSpace";

const TOTAL_STEPS = TAKE_UP_SPACE_QUESTIONS.length;

type Answers = Record<TakeUpSpaceQuestion["field"], string>;

function initialAnswers(): Answers {
  return Object.fromEntries(
    TAKE_UP_SPACE_QUESTIONS.map((q) => [q.field, ""]),
  ) as Answers;
}

function resolveText(
  text: string | Record<TakeUpSpaceMode, string>,
  mode: TakeUpSpaceMode,
): string {
  return typeof text === "string" ? text : text[mode];
}

interface TakeUpSpaceLoggerProps {
  onClose: () => void;
}

export function TakeUpSpaceLogger({ onClose }: TakeUpSpaceLoggerProps) {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<TakeUpSpaceMode>("in_the_moment");
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  const isPlaceholder = step >= TOTAL_STEPS;
  const question = isPlaceholder ? null : TAKE_UP_SPACE_QUESTIONS[step];

  function handleAnswerChange(
    field: TakeUpSpaceQuestion["field"],
    value: string,
  ) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <ProtocolModal onClose={onClose}>
      {question && (
        <>
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
              onChange={(e) =>
                handleAnswerChange(question.field, e.target.value)
              }
              rows={4}
              className="w-full resize-none bg-card rounded-2xl px-4 py-3 font-sans text-[13px] text-plum placeholder:text-muted focus:outline-none"
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
                  onClick={() => setStep((s) => s + 1)}
                  className="font-sans text-[13px] text-muted"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="bg-rose text-canvas rounded-2xl px-6 py-3 font-sans text-[13px] font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {isPlaceholder && (
        <div className="flex flex-col gap-6 px-6 pt-3 pb-12">
          <p className="font-serif italic text-[16px] text-plum">
            Categorisation coming in Session G.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-rose text-canvas rounded-2xl py-3 font-sans text-[13px] font-medium"
          >
            Close
          </button>
        </div>
      )}
    </ProtocolModal>
  );
}
