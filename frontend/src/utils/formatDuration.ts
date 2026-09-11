/**
 * Formats a duration in seconds into a human-readable display string.
 *
 * Examples:
 *   - null / undefined / <= 0: "—"
 *   - 45: "45s"
 *   - 120: "2 min"
 *   - 195: "3m 15s"
 *   - 3600: "1 hr"
 *   - 4500: "1 hr 15 min"
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) {
    return '—';
  }

  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    if (mins > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${hrs} hr`;
  }

  if (mins > 0) {
    if (secs > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${mins} min`;
  }

  return `${secs}s`;
}
