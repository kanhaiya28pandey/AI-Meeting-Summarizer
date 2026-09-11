import type { MeetingStatus } from '../types/meeting.ts';

export const PROCESSING_POLL_INTERVAL = 2000;

export const IN_PROGRESS_STATUSES: MeetingStatus[] = [
  'UPLOADED',
  'TRANSCRIBING',
  'ANALYZING',
  'SAVING',
];

export interface StageDefinition {
  status: MeetingStatus;
  label: string;
  description: string;
}

export const PROCESSING_STAGES: StageDefinition[] = [
  {
    status: 'UPLOADED',
    label: 'Upload received',
    description: 'Meeting recording uploaded and queued for processing.',
  },
  {
    status: 'TRANSCRIBING',
    label: 'Transcribing',
    description: 'Converting your meeting into text...',
  },
  {
    status: 'ANALYZING',
    label: 'AI Analysis',
    description: 'Extracting summary and action items...',
  },
  {
    status: 'SAVING',
    label: 'Saving',
    description: 'Preparing your results...',
  },
  {
    status: 'COMPLETED',
    label: 'Meeting ready',
    description: 'Your meeting notes, summary, and action items are ready.',
  },
];

export const STAGE_ORDER: MeetingStatus[] = [
  'UPLOADED',
  'TRANSCRIBING',
  'ANALYZING',
  'SAVING',
  'COMPLETED',
];

export function isProcessingStatus(status: MeetingStatus | undefined | null): boolean {
  if (!status) return false;
  return IN_PROGRESS_STATUSES.includes(status);
}
