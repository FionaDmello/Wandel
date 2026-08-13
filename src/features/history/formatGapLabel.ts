export function formatGapLabel(gapDays: number): string {
  if (gapDays === 0) return "Same day";
  if (gapDays === 1) return "Next morning";
  return `${gapDays} days`;
}
