import type { StandingUpEntry } from "@/types/database";

export interface StandingUpTrack {
  id: string;
  trackName: string;
  entries: StandingUpEntry[];
}
