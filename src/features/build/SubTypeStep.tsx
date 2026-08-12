import { Plus, X } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import type { SubTypeConfig } from "@/hooks/useBuildHabits";

interface SubTypeCardProps {
  name: string;
  onRemove: () => void;
}

function SubTypeCard({ name, onRemove }: SubTypeCardProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-card rounded-2xl border-l-[3px] border-l-amber">
      <span className="font-sans text-[13px] font-medium text-plum">
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 text-muted bg-transparent border-none cursor-pointer"
        aria-label={`Remove ${name}`}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

interface SubTypeStepProps {
  habitName: string;
  onNext: (subTypes: SubTypeConfig[]) => void;
  onCancel: () => void;
}

export function SubTypeStep({ habitName, onNext, onCancel }: SubTypeStepProps) {
  const [subTypes, setSubTypes] = useState<SubTypeConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAnchor, setFormAnchor] = useState("");
  const [formNonNeg, setFormNonNeg] = useState("");
  const [formMin, setFormMin] = useState("");
  const [formFull, setFormFull] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormName("");
    setFormAnchor("");
    setFormNonNeg("");
    setFormMin("");
    setFormFull("");
    setFormError(null);
    setShowForm(false);
  };

  const addSubType = () => {
    const name = formName.trim();
    if (
      !name ||
      !formAnchor.trim() ||
      !formNonNeg.trim() ||
      !formMin.trim() ||
      !formFull.trim()
    ) {
      setFormError("Fill in all fields.");
      return;
    }
    if (subTypes.some((s) => s.subType === name)) {
      setFormError("A variation with this name already exists.");
      return;
    }
    setSubTypes((prev) => [
      ...prev,
      {
        subType: name,
        anchor: formAnchor.trim(),
        nonNegotiable: formNonNeg.trim(),
        minimumVersion: formMin.trim(),
        fullVersion: formFull.trim(),
      },
    ]);
    resetForm();
  };

  const inputClass = `w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none placeholder:text-muted`;

  return (
    <ScreenWrap>
      <div className="flex flex-col px-8 py-12 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-serif italic text-[32px] leading-tight text-plum">
            Does {habitName} have variations?
          </h2>
          <p className="font-sans text-xs text-muted">
            e.g. Yoga, Swimming, Gym. Skip if not.
          </p>
        </div>

        {subTypes.length > 0 && (
          <div className="flex flex-col gap-2">
            {subTypes.map((st) => (
              <SubTypeCard
                key={st.subType}
                name={st.subType!}
                onRemove={() =>
                  setSubTypes((prev) =>
                    prev.filter((s) => s.subType !== st.subType),
                  )
                }
              />
            ))}
          </div>
        )}

        {showForm ? (
          <div className="flex flex-col gap-4 p-4 bg-card rounded-2xl border-l-[3px] border-l-border">
            <div className="flex flex-col gap-2">
              <Label>Variation name</Label>
              <input
                type="text"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Yoga"
                className={inputClass}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Anchor</Label>
              <input
                type="text"
                value={formAnchor}
                onChange={(e) => {
                  setFormAnchor(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. After morning coffee"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Non-negotiable</Label>
              <input
                type="text"
                value={formNonNeg}
                onChange={(e) => {
                  setFormNonNeg(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. 5 sun salutations"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Minimum version</Label>
              <input
                type="text"
                value={formMin}
                onChange={(e) => {
                  setFormMin(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. 20 minute flow"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Full session</Label>
              <input
                type="text"
                value={formFull}
                onChange={(e) => {
                  setFormFull(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. 60 minute practice"
                className={inputClass}
              />
            </div>
            {formError && (
              <p className="font-sans text-[11px] text-amber">{formError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="accent" onClick={addSubType}>
                Add
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-l-transparent text-muted border-none cursor-pointer"
          >
            <Plus size={13} strokeWidth={2} />
            <span className="font-sans text-[13px]">Add a variation</span>
          </button>
        )}

        <Button variant="primary" onClick={() => onNext(subTypes)}>
          {subTypes.length > 0 ? "Next" : "Skip — no variations"}
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </ScreenWrap>
  );
}
