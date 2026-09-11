import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration } from './formatDuration.ts';
import { formatTimestamp } from './formatTimestamp.ts';

describe('formatDuration', () => {
  it('handles null, undefined, NaN, and non-positive numbers with dash', () => {
    assert.equal(formatDuration(null), '—');
    assert.equal(formatDuration(undefined), '—');
    assert.equal(formatDuration(NaN), '—');
    assert.equal(formatDuration(0), '—');
    assert.equal(formatDuration(-10), '—');
  });

  it('formats seconds under one minute', () => {
    assert.equal(formatDuration(45), '45s');
    assert.equal(formatDuration(1), '1s');
  });

  it('formats minutes and seconds under one hour', () => {
    assert.equal(formatDuration(60), '1 min');
    assert.equal(formatDuration(120), '2 min');
    assert.equal(formatDuration(195), '3m 15s');
    assert.equal(formatDuration(3599), '59m 59s');
  });

  it('formats hours and minutes', () => {
    assert.equal(formatDuration(3600), '1 hr');
    assert.equal(formatDuration(4500), '1 hr 15 min');
    assert.equal(formatDuration(7200), '2 hr');
    assert.equal(formatDuration(7320), '2 hr 2 min');
  });
});

describe('formatTimestamp', () => {
  it('handles null, undefined, NaN, and negative with 00:00', () => {
    assert.equal(formatTimestamp(null), '00:00');
    assert.equal(formatTimestamp(undefined), '00:00');
    assert.equal(formatTimestamp(NaN), '00:00');
    assert.equal(formatTimestamp(-5), '00:00');
  });

  it('formats seconds into mm:ss', () => {
    assert.equal(formatTimestamp(0), '00:00');
    assert.equal(formatTimestamp(9), '00:09');
    assert.equal(formatTimestamp(65), '01:05');
    assert.equal(formatTimestamp(599), '09:59');
  });

  it('formats hours into h:mm:ss', () => {
    assert.equal(formatTimestamp(3600), '1:00:00');
    assert.equal(formatTimestamp(3665), '1:01:05');
    assert.equal(formatTimestamp(7325), '2:02:05');
  });
});
