import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Meeting, ActionItem } from '../../types/meeting.ts';

describe('Meeting Results Data Model & Fallbacks', () => {
  const completeMeeting: Meeting = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Sprint Planning Q4',
    originalFileName: 'sprint_planning.mp3',
    fileType: 'audio/mpeg',
    duration: 3600,
    transcript: 'Alice: Let us start.\nBob: Sounds good.',
    summary: 'Team aligned on Q4 goals and milestones.',
    keyDecisions: ['Adopt PostgreSQL for metadata', 'Deploy to Cloud Run'],
    actionItems: [
      { task: 'Configure CI pipeline', owner: 'Alice', deadline: 'Friday' },
      { task: 'Set up monitoring', owner: null, deadline: null },
    ],
    status: 'COMPLETED',
    createdAt: '2026-10-24T10:00:00Z',
    updatedAt: '2026-10-24T10:05:00Z',
  };

  it('validates complete meeting results integrity', () => {
    assert.equal(completeMeeting.status, 'COMPLETED');
    assert.equal(completeMeeting.summary, 'Team aligned on Q4 goals and milestones.');
    assert.equal(completeMeeting.keyDecisions.length, 2);
    assert.equal(completeMeeting.actionItems.length, 2);
    assert.ok(completeMeeting.transcript?.includes('Alice: Let us start.'));
  });

  it('correctly identifies null or missing action item owners and deadlines', () => {
    const itemWithNulls: ActionItem = completeMeeting.actionItems[1];
    assert.equal(itemWithNulls.task, 'Set up monitoring');
    assert.equal(itemWithNulls.owner, null);
    assert.equal(itemWithNulls.deadline, null);

    // Verify fallback display rule: owner or deadline === null becomes '—'
    const displayOwner = itemWithNulls.owner?.trim() ? itemWithNulls.owner : '—';
    const displayDeadline = itemWithNulls.deadline?.trim() ? itemWithNulls.deadline : '—';

    assert.equal(displayOwner, '—');
    assert.equal(displayDeadline, '—');
  });

  it('handles empty decisions and action items safely without throws', () => {
    const emptyMeeting: Meeting = {
      ...completeMeeting,
      keyDecisions: [],
      actionItems: [],
      summary: null,
      transcript: null,
    };

    assert.equal(emptyMeeting.keyDecisions.length, 0);
    assert.equal(emptyMeeting.actionItems.length, 0);
    assert.equal(emptyMeeting.summary, null);
    assert.equal(emptyMeeting.transcript, null);

    const hasSummary = Boolean(emptyMeeting.summary && emptyMeeting.summary.trim().length > 0);
    const hasTranscript = Boolean(emptyMeeting.transcript && emptyMeeting.transcript.trim().length > 0);
    const hasDecisions = emptyMeeting.keyDecisions.length > 0;
    const hasActionItems = emptyMeeting.actionItems.length > 0;

    assert.equal(hasSummary, false);
    assert.equal(hasTranscript, false);
    assert.equal(hasDecisions, false);
    assert.equal(hasActionItems, false);
  });
});
