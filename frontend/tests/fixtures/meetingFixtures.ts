import type { MeetingResponse } from '../../src/types/meeting';

export const mockCompletedMeeting: MeetingResponse = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Sprint Retrospective',
  originalFileName: 'retro.mp4',
  fileType: 'video/mp4',
  duration: 1800,
  transcript: 'Alice: We accomplished all sprint goals.\nBob: Let us prepare for next cycle.',
  summary: 'The team completed all sprint goals and planned the next release.',
  keyDecisions: ['Launch on Friday', 'Migrate database on Saturday'],
  actionItems: [
    {
      task: 'Prepare release notes',
      owner: 'Alice',
      deadline: '2026-09-18',
    },
    {
      task: 'Update deployment runbook',
      owner: null,
      deadline: null,
    },
  ],
  status: 'COMPLETED',
  createdAt: '2026-09-10T10:00:00Z',
  updatedAt: '2026-09-10T10:30:00Z',
};

export const mockProcessingMeeting: MeetingResponse = {
  id: '22222222-2222-2222-2222-222222222222',
  title: 'Quarterly Review',
  originalFileName: 'q3_review.mp3',
  fileType: 'audio/mpeg',
  duration: 900,
  transcript: null,
  summary: null,
  keyDecisions: [],
  actionItems: [],
  status: 'TRANSCRIBING',
  createdAt: '2026-09-11T12:00:00Z',
  updatedAt: '2026-09-11T12:05:00Z',
};

export const mockFailedMeeting: MeetingResponse = {
  id: '33333333-3333-3333-3333-333333333333',
  title: 'Corrupted Recording',
  originalFileName: 'corrupted.mp3',
  fileType: 'audio/mpeg',
  duration: 0,
  transcript: null,
  summary: null,
  keyDecisions: [],
  actionItems: [],
  status: 'FAILED',
  createdAt: '2026-09-11T14:00:00Z',
  updatedAt: '2026-09-11T14:02:00Z',
};

export const mockXssMeeting: MeetingResponse = {
  id: '44444444-4444-4444-4444-444444444444',
  title: 'Security Testing Meeting',
  originalFileName: 'sec.mp3',
  fileType: 'audio/mpeg',
  duration: 60,
  transcript: '<script>alert("xss")</script><img src=x onerror=alert(1)>',
  summary: '<b onmouseover=alert("summary_xss")>Critical summary</b>',
  keyDecisions: ['<script>evil()</script>'],
  actionItems: [
    {
      task: '<img src=x onerror=alert("task_xss")>',
      owner: '<script>alert("owner_xss")</script>',
      deadline: '<b>Tomorrow</b>',
    },
  ],
  status: 'COMPLETED',
  createdAt: '2026-09-11T15:00:00Z',
  updatedAt: '2026-09-11T15:05:00Z',
};
