import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface JournalDaySectionProps {
  summary: React.ReactNode;
  dotClassName: string;
  children: React.ReactNode;
}

export function JournalDaySection({
  summary,
  dotClassName,
  children,
}: JournalDaySectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-canvas rounded-2xl px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full bg-transparent border-none cursor-pointer text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClassName}`} />
          <span className="font-serif text-[14px] font-medium text-plum">
            {summary}
          </span>
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted shrink-0" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-1.5 pt-3 pl-[18px]">{children}</div>
      )}
    </div>
  );
}
