import { EMPTY_TAKE_UP_SPACE_FILTERS } from "@/constants/takeUpSpaceFilters";
import { MODE_OPTIONS } from "@/constants/takeUpSpaceModeLabels";
import {
  OUTCOME_OPTIONS,
  PANEL_TAG_OPTIONS,
} from "@/constants/takeUpSpacePanelOptions";
import { ProtocolModal } from "@/features/protocols/ProtocolModal";
import type {
  TakeUpSpaceEntry,
  TakeUpSpaceFilters,
  TakeUpSpaceMode,
  TakeUpSpaceOutcome,
  TakeUpSpacePanelTag,
} from "@/types/takeUpSpace";

interface TakeUpSpaceFilterSheetProps {
  entries: TakeUpSpaceEntry[];
  filters: TakeUpSpaceFilters;
  onChange: (filters: TakeUpSpaceFilters) => void;
  onClose: () => void;
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 font-sans text-[12px] font-medium ${
        selected ? "bg-rose text-canvas" : "bg-card text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-[9px] font-medium text-rose-dark uppercase tracking-widest">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

export function TakeUpSpaceFilterSheet({
  entries,
  filters,
  onChange,
  onClose,
}: TakeUpSpaceFilterSheetProps) {
  const tagNameOptions = Array.from(
    new Set(entries.flatMap((entry) => entry.tag_names)),
  );

  function toggleOutcome(value: TakeUpSpaceOutcome) {
    const outcomes = filters.outcomes.includes(value)
      ? filters.outcomes.filter((v) => v !== value)
      : [...filters.outcomes, value];
    onChange({ ...filters, outcomes });
  }

  function toggleMode(value: TakeUpSpaceMode) {
    const modes = filters.modes.includes(value)
      ? filters.modes.filter((v) => v !== value)
      : [...filters.modes, value];
    onChange({ ...filters, modes });
  }

  function togglePanelTag(value: TakeUpSpacePanelTag) {
    const panelTags = filters.panelTags.includes(value)
      ? filters.panelTags.filter((v) => v !== value)
      : [...filters.panelTags, value];
    onChange({ ...filters, panelTags });
  }

  function toggleTagName(name: string) {
    const tagNames = filters.tagNames.includes(name)
      ? filters.tagNames.filter((n) => n !== name)
      : [...filters.tagNames, name];
    onChange({ ...filters, tagNames });
  }

  return (
    <ProtocolModal title="Filter entries" onClose={onClose}>
      <div className="flex flex-col gap-5 px-6 pt-3 pb-8">
        <ChipGroup
          label="Outcome"
          options={OUTCOME_OPTIONS}
          selected={filters.outcomes}
          onToggle={toggleOutcome}
        />
        <ChipGroup
          label="Mode"
          options={MODE_OPTIONS}
          selected={filters.modes}
          onToggle={toggleMode}
        />
        <ChipGroup
          label="Panel tag"
          options={PANEL_TAG_OPTIONS}
          selected={filters.panelTags}
          onToggle={togglePanelTag}
        />

        <div className="flex flex-col gap-2">
          <span className="font-sans text-[9px] font-medium text-rose-dark uppercase tracking-widest">
            Tags
          </span>
          <div className="flex flex-wrap gap-2">
            <Chip
              label="No tags"
              selected={filters.noTags}
              onClick={() => onChange({ ...filters, noTags: !filters.noTags })}
            />
            {tagNameOptions.map((name) => (
              <Chip
                key={name}
                label={name}
                selected={filters.tagNames.includes(name)}
                onClick={() => toggleTagName(name)}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange(EMPTY_TAKE_UP_SPACE_FILTERS)}
          className="font-sans text-[13px] text-muted text-left"
        >
          Clear
        </button>
      </div>
    </ProtocolModal>
  );
}
