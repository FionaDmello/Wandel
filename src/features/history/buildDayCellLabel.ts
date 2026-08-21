export function buildDayCellLabel(
  day: number,
  hasEngineActivity: boolean,
  hasCleanBreakDay: boolean,
  buildCount: number,
): string {
  const parts: string[] = [];
  if (hasEngineActivity) parts.push("Engine activity");
  if (hasCleanBreakDay) parts.push("Clean day");
  if (buildCount > 0) {
    parts.push(`${buildCount} build ${buildCount === 1 ? "log" : "logs"}`);
  }
  if (parts.length === 0) return `${day}`;
  return `${day} — ${parts.join(", ")}`;
}
