const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  while (current !== null && typeof current === "object") {
    if ((current as { code?: unknown }).code === UNIQUE_VIOLATION) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
}
