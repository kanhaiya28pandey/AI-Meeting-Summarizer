/**
 * Formats an ISO date string into a localized human-readable date.
 *
 * Example:
 *   - "2026-10-24T14:30:00Z" -> "Oct 24, 2026"
 *   - null / undefined / invalid -> "—"
 */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '—';
  }

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats an ISO date string into a localized human-readable date and time.
 *
 * Example:
 *   - "2026-10-24T14:30:00Z" -> "Oct 24, 2026, 2:30 PM"
 *   - null / undefined / invalid -> "—"
 */
export function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '—';
  }

  const date = new Date(isoDate);
  if (isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
