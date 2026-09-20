import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { Meeting } from '../../types/meeting.ts';
import { getCardSummaryPreview, formatAudioFormat } from '../../utils/meetingDisplay.ts';

describe('MeetingCard Helpers & Data Logic', () => {
  const sampleMeeting: Meeting = {
    id: 'b767756f-6d0e-4ec1-912b-2877a561f71a',
    title: 'Weekly Standup',
    originalFileName: 'standup.mp3',
    fileType: 'audio/mpeg',
    duration: 1800,
    transcript: 'Team discussed progress on the new user authentication module.',
    summary: 'The team reviewed sprint items and resolved blocker on auth.',
    keyDecisions: [],
    actionItems: [],
    status: 'COMPLETED',
    createdAt: '2026-09-11T12:00:00Z',
    updatedAt: '2026-09-11T12:10:00Z',
  };

  it('formats audio format from fileType strings', () => {
    assert.equal(formatAudioFormat('audio/mpeg'), 'MP3');
    assert.equal(formatAudioFormat('audio/mp3'), 'MP3');
    assert.equal(formatAudioFormat('audio/wav'), 'WAV');
    assert.equal(formatAudioFormat('audio/m4a'), 'M4A');
    assert.equal(formatAudioFormat('audio/mp4'), 'M4A');
    assert.equal(formatAudioFormat('audio/aac'), 'M4A');
    assert.equal(formatAudioFormat('audio/flac'), 'AUDIO/FLAC');
    assert.equal(formatAudioFormat(null), 'AUDIO');
    assert.equal(formatAudioFormat(undefined), 'AUDIO');
  });

  it('generates summary preview for completed meetings', () => {
    const preview = getCardSummaryPreview(sampleMeeting);
    assert.equal(preview, 'The team reviewed sprint items and resolved blocker on auth.');
  });

  it('strips markdown headings and artifacts from summary preview', () => {
    const markdownMeeting: Meeting = {
      ...sampleMeeting,
      summary: '### Executive Overview The sprint goals were met ahead of schedule.',
    };
    const preview = getCardSummaryPreview(markdownMeeting);
    assert.equal(preview, 'The sprint goals were met ahead of schedule.');
  });

  it('truncates lengthy summaries over 180 characters', () => {
    const longSummary = 'A'.repeat(250);
    const meetingWithLongSummary: Meeting = {
      ...sampleMeeting,
      summary: longSummary,
    };

    const preview = getCardSummaryPreview(meetingWithLongSummary);
    assert.equal(preview.length, 183); // 180 + "..."
    assert.ok(preview.endsWith('...'));
  });

  it('displays fallback when completed meeting has no summary', () => {
    const meetingWithoutSummary: Meeting = {
      ...sampleMeeting,
      summary: null,
    };
    assert.equal(getCardSummaryPreview(meetingWithoutSummary), 'No summary available.');
  });

  it('displays processing preview for active statuses', () => {
    const activeStatuses: Meeting['status'][] = ['UPLOADED', 'TRANSCRIBING', 'ANALYZING', 'SAVING'];
    for (const s of activeStatuses) {
      const activeMeeting: Meeting = { ...sampleMeeting, status: s, summary: null };
      assert.equal(getCardSummaryPreview(activeMeeting), 'Processing meeting...');
    }
  });

  it('displays failure preview for failed meetings', () => {
    const failedMeeting: Meeting = { ...sampleMeeting, status: 'FAILED', summary: null };
    assert.equal(getCardSummaryPreview(failedMeeting), 'Processing could not be completed.');
  });

  it('handles deletion filtering and transition to empty state', () => {
    const list: Meeting[] = [sampleMeeting];
    assert.equal(list.length, 1);

    // Deleting the single meeting
    const filtered = list.filter((m) => m.id !== sampleMeeting.id);
    assert.equal(filtered.length, 0);
  });
});
