import type { Meeting } from '../types/meeting';

export function formatAudioFormat(fileType: string | null | undefined): string {
  if (!fileType) return 'AUDIO';
  const lower = fileType.toLowerCase();
  if (lower.includes('mpeg') || lower.includes('mp3')) return 'MP3';
  if (lower.includes('wav')) return 'WAV';
  if (lower.includes('m4a') || lower.includes('mp4') || lower.includes('aac')) return 'M4A';
  return fileType.toUpperCase();
}

/**
 * Strips raw markdown headers, bold asterisks, and hash artifacts from executive summaries.
 */
export function cleanSummaryMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s*(?:Executive\s+Overview|Overview|Summary|Meeting\s+Summary)?[\s:]*/gim, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[*_#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCardSummaryPreview(meeting: Meeting): string {
  if (meeting.status === 'COMPLETED') {
    if (meeting.summary && meeting.summary.trim().length > 0) {
      const cleaned = cleanSummaryMarkdown(meeting.summary);
      const target = cleaned.length > 0 ? cleaned : meeting.summary.trim();
      return target.length > 180 ? `${target.slice(0, 180)}...` : target;
    }
    return 'No summary available.';
  }
  if (meeting.status === 'FAILED') {
    return 'Processing could not be completed.';
  }
  return 'Processing meeting...';
}
