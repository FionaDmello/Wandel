import { addDays, differenceInDays, format, parseISO } from "date-fns";

export interface StandingUpResolution {
  fallDate: string;
  returnDate: string;
  gapDays: number;
}

function nextDay(date: string): string {
  return format(addDays(parseISO(date), 1), "yyyy-MM-dd");
}

export function computeStandingUpResolutions(
  fallDates: string[],
  today: string,
): StandingUpResolution[] {
  const sorted = [...new Set(fallDates)].sort();
  const resolutions: StandingUpResolution[] = [];

  let i = 0;
  while (i < sorted.length) {
    const fallDate = sorted[i];
    let runEnd = fallDate;
    i++;
    while (i < sorted.length && sorted[i] === nextDay(runEnd)) {
      runEnd = sorted[i];
      i++;
    }

    const candidateReturn = nextDay(runEnd);
    if (candidateReturn >= today) break;

    resolutions.push({
      fallDate,
      returnDate: candidateReturn,
      gapDays: differenceInDays(parseISO(candidateReturn), parseISO(fallDate)),
    });
  }

  return resolutions;
}
