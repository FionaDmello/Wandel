export function isDuplicateVariationName(
  existingNames: string[],
  candidate: string,
): boolean {
  const normalized = candidate.toLowerCase();
  return existingNames.some(
    (existing) => existing.toLowerCase() === normalized,
  );
}
