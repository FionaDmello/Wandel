import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Label } from "@/components/ui/Label";
import { MarkIndicator } from "@/components/ui/MarkIndicator";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { MARKS } from "@/constants/marks";
import {
  useHabitDayObservations,
  useUpsertBuildObservation,
} from "@/hooks/useBuildObservations";
import type { HabitConfig, MarkType } from "@/types/database";

function getConfigValue(
  configs: HabitConfig[],
  key: string,
  subType: string | null,
): string {
  return (
    configs.find((c) => c.key === key && c.sub_type === subType)?.value ?? ""
  );
}

function getSubTypes(configs: HabitConfig[]): string[] {
  return [
    ...new Set(
      configs
        .filter((c) => c.sub_type !== null)
        .map((c) => c.sub_type as string),
    ),
  ];
}

interface MarkFormProps {
  configs: HabitConfig[];
  subType: string | null;
  existingId: string | null;
  existingMark: MarkType | null;
  existingNote: string;
  habitId: string;
  habitName: string;
  userId: string;
  date?: string;
  onLogged?: () => void;
}

function MarkForm({
  configs,
  subType,
  existingId,
  existingMark,
  existingNote,
  habitId,
  habitName,
  userId,
  date,
  onLogged,
}: MarkFormProps) {
  const [selectedMark, setSelectedMark] = useState<MarkType | null>(
    existingMark,
  );
  const [note, setNote] = useState(existingNote);
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { mutate: upsert, isPending } = useUpsertBuildObservation(userId);

  const anchor = getConfigValue(configs, "anchor", subType);
  const logDate = date ?? format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => {
      setConfirming(false);
      onLogged?.();
    }, 800);
    return () => clearTimeout(timer);
  }, [confirming, onLogged]);

  const handleLog = () => {
    setSubmitted(true);
    if (!selectedMark) return;

    const markDef = MARKS.find((m) => m.type === selectedMark)!;
    upsert(
      {
        id: existingId ?? undefined,
        habit_id: habitId,
        date: logDate,
        sub_type: subType ?? null,
        mark_type: selectedMark,
        mark_label: markDef.label,
        note: note.trim() || undefined,
      },
      { onSuccess: () => setConfirming(true) },
    );
  };

  if (confirming) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="font-serif italic text-[28px] text-plum">Logged.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {anchor && (
        <p className="font-serif italic text-[17px] text-violet leading-snug">
          After {anchor}, did you show up for {subType ?? habitName} today?
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label>How did you show up?</Label>
        <div className="flex flex-col gap-2">
          {MARKS.map(({ type, label, configKey }) => {
            const description = getConfigValue(configs, configKey, subType);
            const isSelected = selectedMark === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedMark(type);
                  setSubmitted(false);
                }}
                className={`flex items-center gap-4 w-full text-left px-4 py-3 rounded-2xl bg-card border-l-[3px] transition-colors duration-100 border-none cursor-pointer ${
                  isSelected
                    ? "border-l-amber"
                    : submitted && !selectedMark
                      ? "border-l-amber/40"
                      : "border-l-transparent"
                }`}
              >
                <MarkIndicator type={type} selected={isSelected} />
                <div className="flex flex-col gap-[2px]">
                  <span className="font-sans text-[13px] font-medium text-plum">
                    {label}
                  </span>
                  {description && (
                    <span className="font-sans text-[11px] text-muted">
                      {description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {submitted && !selectedMark && (
          <p className="font-sans text-[11px] text-amber">
            Select how you showed up.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Note (optional)</Label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Anything worth remembering?"
          className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none resize-none placeholder:text-muted`}
        />
      </div>

      <Button variant="accent" onClick={handleLog} disabled={isPending}>
        {isPending ? "Saving…" : existingMark ? "Update" : "Log it"}
      </Button>
    </div>
  );
}

interface BuildLogFormProps {
  userId: string;
  habitId: string;
  habitName: string;
  configs: HabitConfig[];
  date?: string;
}

export function BuildLogForm({
  userId,
  habitId,
  habitName,
  configs,
  date,
}: BuildLogFormProps) {
  const safeConfigs = configs ?? [];
  const subTypes = getSubTypes(safeConfigs);
  const hasSubTypes = subTypes.length > 0;

  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);

  const todayObsQuery = useHabitDayObservations(userId, habitId, date);
  const todayObs = todayObsQuery.data ?? [];

  const findObs = (subType: string | null) =>
    todayObs.find((o) => o.sub_type === subType) ?? null;

  if (todayObsQuery.isLoading) return null;

  if (hasSubTypes) {
    const loggedSubTypes = new Set(
      todayObs.map((o) => o.sub_type).filter(Boolean),
    );

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Which variation?</Label>
          <div className="flex flex-wrap gap-2">
            {subTypes.map((st) => (
              <div key={st} className="relative">
                <Chip
                  label={st}
                  selected={selectedSubType === st}
                  onToggle={() =>
                    setSelectedSubType(selectedSubType === st ? null : st)
                  }
                />
                {loggedSubTypes.has(st) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-teal" />
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedSubType && (
          <MarkForm
            key={selectedSubType}
            configs={safeConfigs}
            subType={selectedSubType}
            existingId={findObs(selectedSubType)?.id ?? null}
            existingMark={findObs(selectedSubType)?.mark_type ?? null}
            existingNote={findObs(selectedSubType)?.note ?? ""}
            habitId={habitId}
            habitName={habitName}
            userId={userId}
            date={date}
            onLogged={() => setSelectedSubType(null)}
          />
        )}
      </div>
    );
  }

  const existing = findObs(null);

  return (
    <MarkForm
      configs={safeConfigs}
      subType={null}
      existingId={existing?.id ?? null}
      existingMark={existing?.mark_type ?? null}
      existingNote={existing?.note ?? ""}
      habitId={habitId}
      habitName={habitName}
      userId={userId}
      date={date}
    />
  );
}
