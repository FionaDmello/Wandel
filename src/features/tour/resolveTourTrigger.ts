import type { Profile } from "@/types/database";

export type TourTrigger = "part1" | "part2" | null;

const HABIT_DETAIL_PATTERN = /^\/(break|build)\/[^/]+$/;

export function resolveTourTrigger(
  profile: Pick<Profile, "tour_completed" | "habit_intro_seen">,
  pathname: string,
  hasPendingProtocol: boolean,
): TourTrigger {
  if (!profile.tour_completed) {
    return pathname === "/engine" ? "part1" : null;
  }

  if (
    !profile.habit_intro_seen &&
    !hasPendingProtocol &&
    HABIT_DETAIL_PATTERN.test(pathname)
  ) {
    return "part2";
  }

  return null;
}
