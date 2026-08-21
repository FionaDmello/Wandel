import { format, parse } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { buildCalendarGrid } from "@/constants/calendarGrid";
import { trapFocus } from "@/lib/trapFocus";

import { IconButton } from "./IconButton";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DatePickerProps {
  value: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function DatePicker({ value, onSelect, onClose }: DatePickerProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;

  const initDate = parse(value, "yyyy-MM-dd", new Date());
  const [year, setYear] = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth() + 1);

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.isComposing) {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        trapFocus(e, panelRef.current);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isCurrentMonth = year === todayYear && month === todayMonth;
  const monthLabel = format(new Date(year, month - 1, 1), "MMMM yyyy");
  const weeks = buildCalendarGrid(year, month);

  const goToPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else setMonth((m) => m - 1);
  };

  const goToNext = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else setMonth((m) => m + 1);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-plum/40 z-[200] touch-none"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a date"
        tabIndex={-1}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-canvas rounded-t-[24px] z-[201] touch-none pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <IconButton
            onClick={goToPrev}
            ariaLabel="Previous month"
            className="text-muted"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </IconButton>

          <p className="font-sans text-[13px] font-medium text-plum">
            {monthLabel}
          </p>

          <div className="flex items-center gap-2">
            <IconButton
              onClick={goToNext}
              disabled={isCurrentMonth}
              ariaLabel="Next month"
              className={isCurrentMonth ? "text-soft" : "text-muted"}
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </IconButton>
            <IconButton
              onClick={onClose}
              ariaLabel="Close"
              className="text-muted"
            >
              <X size={16} strokeWidth={1.5} />
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-7 px-4 mb-1">
          {WEEK_DAYS.map((d) => (
            <p
              key={d}
              className="font-sans text-[10px] text-muted text-center py-1"
            >
              {d}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-1 px-4 pb-8">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((cell, di) => {
                if (!cell) return <div key={di} />;

                const isFuture = cell.date > today;
                const isSelected = cell.date === value;
                const isToday = cell.date === today;

                const base =
                  "flex items-center justify-center h-9 rounded-xl font-sans text-[13px]";

                const stateClass = isFuture
                  ? "bg-transparent border-none opacity-30 cursor-default text-plum"
                  : isSelected
                    ? "bg-amber border-none text-canvas cursor-pointer"
                    : isToday
                      ? "bg-transparent border border-amber text-amber cursor-pointer"
                      : "bg-transparent border-none text-plum cursor-pointer";

                const cellClass = `${base} ${stateClass}`;

                return (
                  <button
                    key={cell.date}
                    type="button"
                    onClick={() => {
                      if (!isFuture) onSelect(cell.date);
                    }}
                    className={cellClass}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
