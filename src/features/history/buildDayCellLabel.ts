export function buildDayCellLabel(
  day: number,
  hasEngineActivity: boolean,
  breakCount: number,
  buildCount: number,
): string {
  const parts: string[] = [];
  if (hasEngineActivity) parts.push("Engine activity");
  if (breakCount > 0) {
    parts.push(`${breakCount} break ${breakCount === 1 ? "entry" : "entries"}`);
  }
  if (buildCount > 0) {
    parts.push(`${buildCount} build ${buildCount === 1 ? "log" : "logs"}`);
  }
  if (parts.length === 0) return `${day}`;
  return `${day} — ${parts.join(", ")}`;
}
