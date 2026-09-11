/**
 * Formats a duration or offset in seconds into standard audio timestamp display.
 *
 * Examples:
 *   - 0 -> "00:00"
 *   - 65 -> "01:05"
 *   - 3665 -> "1:01:05"
 *   - null / undefined -> "00:00"
 */
export function formatTimestamp(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const paddedMins = hrs > 0 ? String(mins).padStart(2, '0') : String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${paddedMins}:${paddedSecs}`;
  }

  return `${paddedMins}:${paddedSecs}`;
}
