/**
 * Formats a byte count into a human-readable file size string (e.g. 12.4 MB, 850 KB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i === 0) {
    return `${bytes} B`;
  }

  const value = bytes / Math.pow(k, i);
  // Show 1 decimal place unless it's a whole number
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1);
  return `${formatted} ${sizes[i]}`;
}
