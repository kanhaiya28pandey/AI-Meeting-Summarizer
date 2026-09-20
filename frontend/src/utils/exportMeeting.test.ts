import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMeetingMarkdown } from './exportMeeting.ts';
import type { Meeting } from '../types/meeting.ts';

test('generateMeetingMarkdown correctly produces markdown with all sections', () => {
  const mockMeeting: Meeting = {
    id: 'test-123',
    title: 'Quarterly Strategic Alignment',
    originalFileName: 'strategy_sync.mp4',
    fileType: 'video/mp4',
    duration: 125,
    summary: 'Discussed Q3 growth targets, resource allocation, and key hires.',
    keyDecisions: [
      'Approved Q3 budget expansion by 15%',
      'Prioritized AI intelligence features over redesign',
    ],
    actionItems: [
      { task: 'Finalize hiring plan', owner: 'Sarah', deadline: '2026-10-01' },
      { task: 'Prepare tech roadmap', owner: null, deadline: null },
    ],
    transcript: 'Speaker 1: Welcome everyone.\nSpeaker 2: Glad to be here.',
    status: 'COMPLETED',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-20T10:15:00Z',
  };

  const md = generateMeetingMarkdown(mockMeeting);

  assert.ok(md.includes('# Quarterly Strategic Alignment'));
  assert.ok(md.includes('**File:** strategy_sync.mp4'));
  assert.ok(md.includes('**Duration:** 2m 5s'));
  assert.ok(md.includes('## Executive Summary'));
  assert.ok(md.includes('Discussed Q3 growth targets'));
  assert.ok(md.includes('## Key Decisions'));
  assert.ok(md.includes('- Approved Q3 budget expansion by 15%'));
  assert.ok(md.includes('## Action Items'));
  assert.ok(md.includes('| Finalize hiring plan | Sarah | 2026-10-01 |'));
  assert.ok(md.includes('| Prepare tech roadmap | Unassigned | No deadline |'));
  assert.ok(md.includes('## Verbatim Transcript'));
  assert.ok(md.includes('Speaker 1: Welcome everyone.'));
});

test('generateMeetingMarkdown handles empty fields gracefully', () => {
  const minimalMeeting: Meeting = {
    id: 'test-empty',
    title: '',
    originalFileName: '',
    fileType: '',
    duration: null,
    summary: null,
    keyDecisions: [],
    actionItems: [],
    transcript: null,
    status: 'COMPLETED',
    createdAt: '',
    updatedAt: '',
  };

  const md = generateMeetingMarkdown(minimalMeeting);

  assert.ok(md.includes('# Meeting Summary'));
  assert.ok(md.includes('_No executive summary generated._'));
  assert.ok(md.includes('_No key decisions recorded._'));
  assert.ok(md.includes('_No action items recorded._'));
  assert.ok(md.includes('_No transcript available._'));
});
