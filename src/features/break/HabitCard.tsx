import { ChevronRight } from "lucide-react";

import type { HabitStatus } from "@/types/database";

interface HabitCardProps {
  name: string;
  status: HabitStatus;
  onClick: () => void;
}

const STATUS_STYLES: Record<
  HabitStatus,
  { dot: string; label: string; text: string }
> = {
  active: { dot: "bg-teal-dark", label: "Active", text: "text-teal-dark" },
  scheduled: { dot: "bg-violet", label: "Scheduled", text: "text-violet" },
  paused: { dot: "bg-amber", label: "Paused", text: "text-amber" },
  deactivated: { dot: "bg-muted", label: "Deactivated", text: "text-muted" },
};

export function HabitCard({ name, status, onClick }: HabitCardProps) {
  const { dot, label, text } = STATUS_STYLES[status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-4 bg-card rounded-2xl border-l-[3px] border-l-soft text-left cursor-pointer border-none"
    >
      <div className="flex flex-col gap-1">
        <span className="font-sans text-[15px] font-medium text-plum">
          {name}
        </span>
        <div className="flex items-center gap-[6px]">
          <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${dot}`} />
          <span className={`font-sans text-[11px] ${text}`}>{label}</span>
        </div>
      </div>
      <ChevronRight
        size={16}
        strokeWidth={1.5}
        className="text-muted shrink-0"
      />
    </button>
  );
}
