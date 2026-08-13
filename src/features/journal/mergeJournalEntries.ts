import type { StandingUpEntry } from "@/types/database";

export interface JournalDay<TObservation, TSlip> {
  date: string;
  observations: TObservation[];
  slips: TSlip[];
  standingUp: StandingUpEntry | null;
}

export function mergeJournalEntries<
  TObservation extends { date: string },
  TSlip extends { date: string },
>(
  observations: TObservation[],
  slips: TSlip[],
  standingUpEntries: StandingUpEntry[],
): JournalDay<TObservation, TSlip>[] {
  const days = new Map<string, JournalDay<TObservation, TSlip>>();

  const getDay = (date: string): JournalDay<TObservation, TSlip> => {
    let day = days.get(date);
    if (!day) {
      day = { date, observations: [], slips: [], standingUp: null };
      days.set(date, day);
    }
    return day;
  };

  for (const o of observations) getDay(o.date).observations.push(o);
  for (const s of slips) getDay(s.date).slips.push(s);
  for (const e of standingUpEntries) getDay(e.return_date).standingUp = e;

  return [...days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}
