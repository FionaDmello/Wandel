import { format } from "date-fns";

interface DayCellProps {
  date: string;
  day: number;
  hasEngineActivity: boolean;
  breakCount: number;
  buildCount: number;
  isFuture: boolean;
  onTap: () => void;
}

export function DayCell({
  date,
  day,
  hasEngineActivity,
  breakCount,
  buildCount,
  isFuture,
  onTap,
}: DayCellProps) {
  const hasData = hasEngineActivity || breakCount > 0 || buildCount > 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const isActualToday = date === today;

  return (
    <button
      type="button"
      onClick={!isFuture ? onTap : undefined}
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
          <span className="w-[5px] h-[5px] rounded-full bg-gold" />
        )}
        {Array.from({ length: breakCount }).map((_, i) => (
          <span key={i} className="w-[5px] h-[5px] rounded-full bg-teal" />
        ))}
        {Array.from({ length: buildCount }).map((_, i) => (
          <span key={i} className="w-[5px] h-[5px] rounded-full bg-amber" />
        ))}
      </div>
    </button>
  );
}
