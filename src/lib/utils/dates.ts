// 📚 LEARN: Relative time formatting ("3 months ago") is more user-friendly than absolute dates.
// We implement this manually instead of using a library like date-fns to keep bundle size small.

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks}w ago`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months}mo ago`;
  }
  const years = Math.floor(diff / YEAR);
  return `${years}y ago`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
