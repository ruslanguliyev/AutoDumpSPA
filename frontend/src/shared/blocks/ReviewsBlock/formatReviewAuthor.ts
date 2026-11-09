/** `First name + initial.` — design/components.md review list author format. */
export function formatReviewAuthorName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;
  const initial = parts[1]?.[0];
  if (!initial) return trimmed;
  return `${parts[0]} ${initial}.`;
}
