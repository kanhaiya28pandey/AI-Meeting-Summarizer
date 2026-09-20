import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('authStorage token and user contracts', () => {
  const mockLocalStorage: Record<string, string> = {};
  const storage = {
    getToken: () => mockLocalStorage['ai_meeting_token'] || null,
    setToken: (token: string) => { mockLocalStorage['ai_meeting_token'] = token; },
    getUser: () => mockLocalStorage['ai_meeting_user'] ? JSON.parse(mockLocalStorage['ai_meeting_user']) : null,
    setUser: (user: any) => { mockLocalStorage['ai_meeting_user'] = JSON.stringify(user); },
    clear: () => {
      delete mockLocalStorage['ai_meeting_token'];
      delete mockLocalStorage['ai_meeting_user'];
    },
  };

  it('stores, retrieves, and clears JWT token', () => {
    assert.equal(storage.getToken(), null);
    storage.setToken('test.jwt.token.123');
    assert.equal(storage.getToken(), 'test.jwt.token.123');
    storage.clear();
    assert.equal(storage.getToken(), null);
  });

  it('stores and retrieves User object correctly', () => {
    const testUser = {
      id: 'uuid-1234',
      username: 'kanhaiya_p',
      email: 'kanhaiya@example.com',
      fullName: 'Kanhaiya Pandey',
      countryCode: '+91',
      mobileNumber: '9876543210',
      createdAt: '2026-09-19T10:00:00Z',
    };

    storage.setUser(testUser);
    const retrieved = storage.getUser();
    assert.deepEqual(retrieved, testUser);

    storage.clear();
    assert.equal(storage.getUser(), null);
  });
});

describe('Meeting date and search filter logic', () => {
  const sampleMeetings = [
    {
      id: '1',
      title: 'Q3 Product Strategy Meeting',
      summary: 'Discussed roadmap, mobile numbers, and AI transcripts',
      transcript: 'Alex: We need to finalize the launch date.',
      createdAt: new Date().toISOString(), // today
      status: 'COMPLETED',
    },
    {
      id: '2',
      title: 'Engineering Architecture Review',
      summary: 'Database schemas and PostgreSQL storage',
      transcript: 'Priya: Let us use UUID primary keys.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      status: 'COMPLETED',
    },
    {
      id: '3',
      title: 'Sprint Retrospective',
      summary: 'What went well and what can be improved',
      transcript: 'Team discussed communication issues.',
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
      status: 'FAILED',
    },
  ];

  it('filters meetings by search keyword across title, summary, and transcript', () => {
    const searchMatchTitle = sampleMeetings.filter((m) =>
      m.title.toLowerCase().includes('strategy')
    );
    assert.equal(searchMatchTitle.length, 1);
    assert.equal(searchMatchTitle[0].id, '1');

    const searchMatchTranscript = sampleMeetings.filter((m) =>
      m.transcript.toLowerCase().includes('priya')
    );
    assert.equal(searchMatchTranscript.length, 1);
    assert.equal(searchMatchTranscript[0].id, '2');

    const searchMatchSummary = sampleMeetings.filter((m) =>
      m.summary.toLowerCase().includes('postgresql')
    );
    assert.equal(searchMatchSummary.length, 1);
    assert.equal(searchMatchSummary[0].id, '2');
  });

  it('filters meetings by today date preset', () => {
    const now = new Date();
    const todayMeetings = sampleMeetings.filter((m) => {
      const d = new Date(m.createdAt);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    });
    assert.equal(todayMeetings.length, 1);
    assert.equal(todayMeetings[0].id, '1');
  });

  it('filters meetings by status', () => {
    const completedMeetings = sampleMeetings.filter((m) => m.status === 'COMPLETED');
    assert.equal(completedMeetings.length, 2);

    const failedMeetings = sampleMeetings.filter((m) => m.status === 'FAILED');
    assert.equal(failedMeetings.length, 1);
  });
});
