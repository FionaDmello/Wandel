import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

interface TakeUpSpaceTagSelectorProps {
  tags: TakeUpSpaceTag[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function TakeUpSpaceTagSelector({
  tags,
  selectedIds,
  onToggle,
}: TakeUpSpaceTagSelectorProps) {
  const active = tags.filter((t) => t.active);
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {active.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(tag.id)}
            className={`rounded-full px-4 py-2 font-sans text-[12px] font-medium ${
              selected ? "bg-rose text-canvas" : "bg-rose/10 text-rose"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
