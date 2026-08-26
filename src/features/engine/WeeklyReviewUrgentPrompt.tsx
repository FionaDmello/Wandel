import { Link } from "@tanstack/react-router";

interface WeeklyReviewUrgentPromptProps {
  mostRecentSundayStr: string;
}

export function WeeklyReviewUrgentPrompt({
  mostRecentSundayStr,
}: WeeklyReviewUrgentPromptProps) {
  return (
    <div className="bg-card rounded-2xl px-5 py-4 flex flex-col gap-3">
      <p className="font-sans text-[11px] text-amber uppercase tracking-wider">
        Weekly review
      </p>
      <p className="font-serif text-[18px] text-plum leading-snug">
        This week deserves a moment of reflection.
      </p>
      <Link
        to="/review"
        search={{ weekEnding: mostRecentSundayStr }}
        className="font-sans text-[13px] text-amber"
      >
        Start review →
      </Link>
    </div>
  );
}
