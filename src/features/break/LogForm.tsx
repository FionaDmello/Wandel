import { format } from "date-fns";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Divider } from "@/components/ui/Divider";
import { Label } from "@/components/ui/Label";
import { UrgeSlider } from "@/components/ui/UrgeSlider";
import { EMOTIONS } from "@/constants/emotions";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { useBreakObservationById } from "@/hooks/useBreakObservationById";
import {
  useLogBreakObservation,
  useUpdateBreakObservationAftermath,
} from "@/hooks/useBreakObservations";
import { useUpdateBreakObservation } from "@/hooks/useUpdateBreakObservation";
import type { HabitConfig } from "@/types/database";

type LogPhase = "form" | "confirming" | "aftermath";

interface AftermathPhaseProps {
  initialEmotions: string[];
  onSave: (emotions: string[]) => void;
  onSkip: () => void;
  isPending: boolean;
}

function AftermathPhase({
  initialEmotions,
  onSave,
  onSkip,
  isPending,
}: AftermathPhaseProps) {
  const [emotions, setEmotions] = useState<string[]>(initialEmotions);

  const toggle = (e: string) =>
    setEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="font-serif italic text-[20px] text-plum leading-snug">
          How do you feel now?
        </p>
        <p className="font-sans text-xs text-muted">Update or keep the same.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EMOTIONS.map((e) => (
          <Chip
            key={e}
            label={e}
            selected={emotions.includes(e)}
            onToggle={() => toggle(e)}
          />
        ))}
      </div>

      <Button
        variant="primary"
        onClick={() => onSave(emotions)}
        disabled={isPending}
      >
        {isPending ? "Saving…" : "Save aftermath"}
      </Button>
      <button
        type="button"
        onClick={onSkip}
        className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
}

interface LogFormFieldsProps {
  userId: string;
  habitId: string;
  jobConfigs: HabitConfig[];
  date?: string;
  entryId?: string;
  initialJob: string | null;
  initialContext: string;
  initialUrge: number;
  initialEmotions: string[];
}

function LogFormFields({
  userId,
  habitId,
  jobConfigs,
  date,
  entryId,
  initialJob,
  initialContext,
  initialUrge,
  initialEmotions,
}: LogFormFieldsProps) {
  const logDate = date ?? format(new Date(), "yyyy-MM-dd");
  const [phase, setPhase] = useState<LogPhase>("form");
  const [context, setContext] = useState(initialContext);
  const [selectedJob, setSelectedJob] = useState<string | null>(initialJob);
  const [urge, setUrge] = useState(initialUrge);
  const [selectedEmotions, setSelectedEmotions] =
    useState<string[]>(initialEmotions);
  const [observationId, setObservationId] = useState<string | null>(
    entryId ?? null,
  );
  const [submitted, setSubmitted] = useState(false);

  const { mutate: logObservation, isPending: isLogging } =
    useLogBreakObservation(userId);
  const { mutate: updateObservation, isPending: isUpdating } =
    useUpdateBreakObservation(userId);
  const { mutate: updateAftermath, isPending: isSavingAftermath } =
    useUpdateBreakObservationAftermath();

  const jobs = (jobConfigs ?? []).filter((c) => c.key === "job");

  const toggleEmotion = (e: string) =>
    setSelectedEmotions((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );

  const resetForm = () => {
    setPhase("form");
    setContext("");
    setSelectedJob(null);
    setUrge(5);
    setSelectedEmotions([]);
    setObservationId(null);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (!selectedJob || selectedEmotions.length === 0) return;

    if (entryId) {
      updateObservation(
        {
          id: entryId,
          job: selectedJob,
          context: context.trim() || undefined,
          urge_intensity: urge,
          emotions: selectedEmotions,
        },
        {
          onSuccess: () => {
            setObservationId(entryId);
            setPhase("confirming");
          },
        },
      );
      return;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const isRetroactive = logDate !== today;

    logObservation(
      {
        habit_id: habitId,
        job: selectedJob,
        context: context.trim() || undefined,
        urge_intensity: urge,
        emotions: selectedEmotions,
        logged_at: isRetroactive
          ? new Date(`${logDate}T12:00:00.000Z`).toISOString()
          : undefined,
      },
      {
        onSuccess: (obs) => {
          setObservationId(obs.id);
          setPhase("confirming");
        },
      },
    );
  };

  useEffect(() => {
    if (phase !== "confirming") return;
    const timer = setTimeout(() => setPhase("aftermath"), 800);
    return () => clearTimeout(timer);
  }, [phase]);

  const jobMissing = submitted && !selectedJob;
  const emotionsMissing = submitted && selectedEmotions.length === 0;
  const isSaving = isLogging || isUpdating;

  if (phase === "confirming") {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-serif italic text-[28px] text-plum">Logged.</p>
      </div>
    );
  }

  if (phase === "aftermath") {
    return (
      <AftermathPhase
        initialEmotions={selectedEmotions}
        isPending={isSavingAftermath}
        onSave={(emotions) => {
          if (!observationId) return;
          updateAftermath(
            { id: observationId, aftermath: "", emotions, userId },
            { onSuccess: resetForm },
          );
        }}
        onSkip={resetForm}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {jobs.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label id="break-log-jobs-label">What job is it doing?</Label>
          <div
            role="group"
            aria-labelledby="break-log-jobs-label"
            className="flex flex-col gap-2"
          >
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => {
                  setSelectedJob(job.value);
                  setSubmitted(false);
                }}
                aria-pressed={selectedJob === job.value}
                className={`flex items-center justify-between gap-3 w-full text-left px-4 py-3 rounded-2xl bg-card border-l-[3px] transition-colors duration-100 border-none cursor-pointer ${
                  selectedJob === job.value
                    ? "border-l-amber"
                    : jobMissing
                      ? "border-l-amber/40"
                      : "border-l-transparent"
                }`}
              >
                <div className="flex flex-col gap-[2px]">
                  <span className="font-sans text-[13px] font-medium text-plum">
                    {job.value}
                  </span>
                  {job.sub_type && (
                    <span className="font-sans text-[11px] text-muted">
                      {job.sub_type}
                    </span>
                  )}
                </div>
                {selectedJob === job.value && (
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className="text-amber shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
          {jobMissing && (
            <p className="font-sans text-[11px] text-amber">
              Select a job to continue.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="break-log-context">Context</Label>
        <textarea
          id="break-log-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={2}
          placeholder="What's happening right now? (optional)"
          className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum focus:ring-2 ring-violet ring-offset-2 ring-offset-canvas resize-none placeholder:text-muted`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Urge intensity</Label>
        <UrgeSlider value={urge} onChange={setUrge} />
      </div>

      <Divider className="my-0" />

      <div className="flex flex-col gap-2">
        <Label id="break-log-emotions-label">How are you feeling?</Label>
        <div
          role="group"
          aria-labelledby="break-log-emotions-label"
          className="flex flex-wrap gap-2"
        >
          {EMOTIONS.map((e) => (
            <Chip
              key={e}
              label={e}
              selected={selectedEmotions.includes(e)}
              onToggle={() => {
                toggleEmotion(e);
                setSubmitted(false);
              }}
            />
          ))}
        </div>
        {emotionsMissing && (
          <p className="font-sans text-[11px] text-amber">
            Select at least one emotion.
          </p>
        )}
      </div>

      <Button variant="accent" onClick={handleSubmit} disabled={isSaving}>
        {isSaving ? (entryId ? "Saving…" : "Logging…") : "Log it"}
      </Button>
    </div>
  );
}

interface LogFormProps {
  userId: string;
  habitId: string;
  jobConfigs: HabitConfig[];
  date?: string;
  entryId?: string;
}

export function LogForm({
  userId,
  habitId,
  jobConfigs,
  date,
  entryId,
}: LogFormProps) {
  const existingQuery = useBreakObservationById(userId, entryId ?? "");

  if (entryId && existingQuery.isLoading) return null;

  const existing = entryId ? existingQuery.data : undefined;

  return (
    <LogFormFields
      userId={userId}
      habitId={habitId}
      jobConfigs={jobConfigs}
      date={date}
      entryId={entryId}
      initialJob={existing?.job ?? null}
      initialContext={existing?.context ?? ""}
      initialUrge={existing?.urge_intensity ?? 5}
      initialEmotions={existing?.emotions.map((e) => e.value) ?? []}
    />
  );
}
