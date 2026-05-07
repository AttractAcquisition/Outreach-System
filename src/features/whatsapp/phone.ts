export function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const normalized = trimmed.replace(/[\s\-()[\]]/g, "");

  if (!hasLeadingPlus) {
    return normalized;
  }

  return `+${normalized.replace(/^\++/, "")}`;
}
