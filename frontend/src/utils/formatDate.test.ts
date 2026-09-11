import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatDateTime } from './formatDate.ts';

describe('formatDate', () => {
  it('handles null, undefined, and invalid dates with dash', () => {
    assert.equal(formatDate(null), '—');
    assert.equal(formatDate(undefined), '—');
    assert.equal(formatDate('invalid-date'), '—');
  });

  it('formats valid ISO date string correctly', () => {
    const formatted = formatDate('2026-10-24T12:00:00Z');
    assert.ok(formatted.includes('2026'));
    assert.ok(formatted.includes('Oct') || formatted.includes('10'));
  });
});

describe('formatDateTime', () => {
  it('handles null, undefined, and invalid dates with dash', () => {
    assert.equal(formatDateTime(null), '—');
    assert.equal(formatDateTime(undefined), '—');
    assert.equal(formatDateTime('invalid-date'), '—');
  });

  it('formats valid ISO date string with time correctly', () => {
    const formatted = formatDateTime('2026-10-24T14:30:00Z');
    assert.ok(formatted.includes('2026'));
  });
});
