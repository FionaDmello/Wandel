import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import { isDuplicateVariationName } from "@/features/build/isDuplicateVariationName";

interface VariationValues {
  anchor: string;
  nonNegotiable: string;
  minimumVersion: string;
  fullVersion: string;
}

interface BaseVariationConfigStepProps {
  habitName: string;
  initialValues?: Partial<VariationValues>;
  submitLabel?: string;
  onCancel?: () => void;
}

interface NamedVariationConfigStepProps extends BaseVariationConfigStepProps {
  existingNames: string[];
  onNext: (name: string, values: VariationValues) => void;
}

interface UnnamedVariationConfigStepProps extends BaseVariationConfigStepProps {
  existingNames?: undefined;
  onNext: (values: VariationValues) => void;
}

type VariationConfigStepProps =
  | NamedVariationConfigStepProps
  | UnnamedVariationConfigStepProps;

export function VariationConfigStep(props: VariationConfigStepProps) {
  const {
    habitName,
    initialValues = {},
    submitLabel = "Next",
    onCancel,
  } = props;
  const [name, setName] = useState("");
  const [anchor, setAnchor] = useState(initialValues.anchor ?? "");
  const [nonNegotiable, setNonNegotiable] = useState(
    initialValues.nonNegotiable ?? "",
  );
  const [minimumVersion, setMinimumVersion] = useState(
    initialValues.minimumVersion ?? "",
  );
  const [fullVersion, setFullVersion] = useState(
    initialValues.fullVersion ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const inputClass = `w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-sans ${INPUT_TEXT_SIZE} text-plum outline-none placeholder:text-muted`;

  const handleNext = () => {
    if (
      !anchor.trim() ||
      !nonNegotiable.trim() ||
      !minimumVersion.trim() ||
      !fullVersion.trim()
    ) {
      setError("Fill in all fields to continue.");
      return;
    }
    const values = {
      anchor: anchor.trim(),
      nonNegotiable: nonNegotiable.trim(),
      minimumVersion: minimumVersion.trim(),
      fullVersion: fullVersion.trim(),
    };

    if (props.existingNames !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("Give this variation a name.");
        return;
      }
      if (isDuplicateVariationName(props.existingNames, trimmedName)) {
        setError("A variation with this name already exists.");
        return;
      }
      props.onNext(trimmedName, values);
      return;
    }
    props.onNext(values);
  };

  return (
    <div className="flex flex-col px-8 py-12 gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-serif italic text-[32px] leading-tight text-plum">
          Set up {habitName}
        </h2>
        <p className="font-sans text-xs text-muted">
          Define what showing up looks like.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {props.existingNames !== undefined && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="variation-name">Variation name</Label>
            <input
              id="variation-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Yoga"
              className={inputClass}
              autoFocus
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="variation-anchor">
            Anchor — when will you do this?
          </Label>
          <input
            id="variation-anchor"
            type="text"
            value={anchor}
            onChange={(e) => {
              setAnchor(e.target.value);
              setError(null);
            }}
            placeholder="e.g. After morning coffee"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="variation-nonneg">
            Non-negotiable — the bare minimum
          </Label>
          <input
            id="variation-nonneg"
            type="text"
            value={nonNegotiable}
            onChange={(e) => {
              setNonNegotiable(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 5 sun salutations"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="variation-minimum">Minimum version</Label>
          <input
            id="variation-minimum"
            type="text"
            value={minimumVersion}
            onChange={(e) => {
              setMinimumVersion(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 20 minute flow"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="variation-full">Full session</Label>
          <input
            id="variation-full"
            type="text"
            value={fullVersion}
            onChange={(e) => {
              setFullVersion(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 60 minute practice"
            className={inputClass}
          />
        </div>
      </div>

      {error && <p className="font-sans text-xs text-amber">{error}</p>}

      <Button variant="primary" onClick={handleNext}>
        {submitLabel}
      </Button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="font-sans text-[13px] text-muted text-center bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
