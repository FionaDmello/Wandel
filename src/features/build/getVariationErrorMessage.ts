export function getVariationErrorMessage(error: unknown): string | null {
  if (!error) return null;

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  ) {
    return "A variation with this name already exists.";
  }

  return "Something went wrong. Please try again.";
}
