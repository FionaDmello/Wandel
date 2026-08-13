import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface JournalDaySectionProps {
  summary: React.ReactNode;
  children: React.ReactNode;
}

export function JournalDaySection({
  summary,
  children,
}: JournalDaySectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card rounded-2xl px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-left"
      >
        <span className="font-sans text-[13px] text-plum">{summary}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted shrink-0" />
        )}
      </button>

      {open && <div className="flex flex-col gap-1 pt-2">{children}</div>}
    </div>
  );
}
