import type { TakeUpSpaceEntry, TakeUpSpaceFilters } from "@/types/takeUpSpace";

function matchesCategory<T extends string>(
  value: T | null,
  selected: T[],
): boolean {
  return selected.length === 0 || (value !== null && selected.includes(value));
}

export function filterTakeUpSpaceEntries(
  entries: TakeUpSpaceEntry[],
  filters: TakeUpSpaceFilters,
): TakeUpSpaceEntry[] {
  const tagsCategoryActive = filters.tagNames.length > 0 || filters.noTags;

  return entries.filter(
    (entry) =>
      matchesCategory(entry.choice_outcome, filters.outcomes) &&
      matchesCategory(entry.mode, filters.modes) &&
      matchesCategory(entry.panel_tag, filters.panelTags) &&
      (!tagsCategoryActive ||
        (filters.noTags && entry.tag_names.length === 0) ||
        entry.tag_names.some((name) => filters.tagNames.includes(name))),
  );
}
