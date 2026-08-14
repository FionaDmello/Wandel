import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { IconButton } from "@/components/ui/IconButton";

interface MonthNavProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthNav({ year, month, onPrev, onNext }: MonthNavProps) {
  const now = new Date();
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const label = format(new Date(year, month - 1, 1), "MMMM yyyy");

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <IconButton
        onClick={onPrev}
        ariaLabel="Previous month"
        className="text-muted"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </IconButton>

      <p className="font-sans text-[13px] font-medium text-plum">{label}</p>

      <IconButton
        onClick={onNext}
        disabled={isCurrentMonth}
        ariaLabel="Next month"
        className={isCurrentMonth ? "text-soft" : "text-muted"}
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
