import type { TakeUpSpaceMode } from "@/types/takeUpSpace";

export const MODE_LABELS: Record<TakeUpSpaceMode, string> = {
  in_the_moment: "In the moment",
  looking_back: "Looking back",
};

export const MODE_OPTIONS: { value: TakeUpSpaceMode; label: string }[] = [
  { value: "in_the_moment", label: MODE_LABELS.in_the_moment },
  { value: "looking_back", label: MODE_LABELS.looking_back },
];
