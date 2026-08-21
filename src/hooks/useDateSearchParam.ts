import { useSearch } from "@tanstack/react-router";

export function useDateSearchParam(): string | undefined {
  const search = useSearch({ strict: false }) as { date?: string };
  return search.date;
}
