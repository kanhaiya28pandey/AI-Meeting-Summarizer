import type { Meeting } from '../types/meeting';

export function formatAudioFormat(fileType: string | null | undefined): string {
  if (!fileType) return 'AUDIO';
  const lower = fileType.toLowerCase();
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'MP3';
  if (lower.includes('wav')) return 'WAV';
  if (lower.includes('m4a') || lower.includes('mp4') || lower.includes('aac')) return 'M4A';
  return fileType.toUpperCase();
}

export function getCardSummaryPreview(meeting: Meeting): string {
  if (meeting.status === 'COMPLETED') {
    if (meeting.summary && meeting.summary.trim().length > 0) {
      const trimmed = meeting.summary.trim();
      return trimmed.length > 180 ? `${trimmed.slice(0, 180)}...` : trimmed;
    }
    return 'No summary available.';
  }
  if (meeting.status === 'FAILED') {
    return 'Processing could not be completed.';
  }
  return 'Processing meeting...';
}
