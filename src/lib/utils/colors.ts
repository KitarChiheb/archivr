// 📚 LEARN: Deterministic color assignment means the same tag always gets the same color.
// We hash the tag name to a number, then map that to a predefined palette.
// This avoids random color flickering and ensures visual consistency.

const TAG_COLORS = [
  '#833AB4', // Purple (Instagram)
  '#FD1D1D', // Red (Instagram)
  '#F77737', // Orange (Instagram)
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EAB308', // Yellow
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#F97316', // Amber
  '#14B8A6', // Teal
  '#A855F7', // Purple light
  '#E11D48', // Rose
  '#0EA5E9', // Sky
  '#84CC16', // Lime
  '#D946EF', // Fuchsia
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getTagColor(tagName: string): string {
  const index = hashString(tagName) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

// 📚 LEARN: Collection colors are also deterministic but from a smaller, more muted palette
// so they don't clash with the busy tag colors.
const COLLECTION_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#06B6D4', // Cyan
] as const;

export function getCollectionColor(index: number): string {
  return COLLECTION_COLORS[index % COLLECTION_COLORS.length];
}
