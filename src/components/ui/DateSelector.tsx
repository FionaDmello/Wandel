import { format, parse } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";

import { DatePicker } from "./DatePicker";

interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
}

export function DateSelector({ value, onChange }: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayDate = format(
    parse(value, "yyyy-MM-dd", new Date()),
    "EEEE, d MMMM",
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-1"
      >
        <span className="font-serif italic text-[15px] text-plum">
          {displayDate}
        </span>
        <Calendar size={12} className="text-plum shrink-0" />
      </button>

      {isOpen && (
        <DatePicker
          value={value}
          onSelect={onChange}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
