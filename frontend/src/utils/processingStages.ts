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
    label: 'Transcribing audio',
    description: 'Gemini 3.5 is converting meeting audio into verbatim text.',
  },
  {
    status: 'ANALYZING',
    label: 'Analyzing meeting',
    description: 'Gemini AI is extracting executive summary, decisions, and action items.',
  },
  {
    status: 'SAVING',
    label: 'Saving results',
    description: 'Persisting transcript and structured intelligence to database.',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    description: 'Processing complete! Your meeting notes and action items are ready.',
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
