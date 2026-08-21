import { format } from "date-fns";

import { buildDayCellLabel } from "@/features/history/buildDayCellLabel";

interface DayCellProps {
  date: string;
  day: number;
  hasEngineActivity: boolean;
  hasCleanBreakDay: boolean;
  buildCount: number;
  isFuture: boolean;
  onTap: () => void;
}

export function DayCell({
  date,
  day,
  hasEngineActivity,
  hasCleanBreakDay,
  buildCount,
  isFuture,
  onTap,
}: DayCellProps) {
  const hasData = hasEngineActivity || hasCleanBreakDay || buildCount > 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const isActualToday = date === today;

  return (
    <button
      type="button"
      onClick={!isFuture ? onTap : undefined}
      aria-label={buildDayCellLabel(
        day,
        hasEngineActivity,
        hasCleanBreakDay,
        buildCount,
      )}
      className={`flex flex-col items-center justify-center gap-[3px] rounded-xl py-2 min-h-[52px] w-full border-none
        ${isActualToday ? "border border-amber" : "border border-transparent"}
        ${hasData && !isFuture ? "bg-soft cursor-pointer" : "bg-transparent"}
        ${isFuture ? "cursor-default opacity-30" : "cursor-pointer"}
      `}
    >
      <span
        className={`font-sans text-[12px] leading-none ${isActualToday ? "text-amber font-medium" : "text-plum"}`}
      >
        {day}
      </span>
      <div className="flex flex-wrap justify-center gap-[3px]">
        {hasEngineActivity && (
          <span className="w-[5px] h-[5px] rounded-full bg-blue" />
        )}
        {hasCleanBreakDay && (
          <span className="w-[5px] h-[5px] rounded-full bg-teal" />
        )}
        {buildCount > 0 && (
          <span className="w-[5px] h-[5px] rounded-full bg-amber" />
        )}
      </div>
    </button>
  );
}
