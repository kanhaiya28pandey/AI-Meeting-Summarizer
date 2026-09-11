import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAudioFile,
  validateMeetingTitle,
  MAX_AUDIO_FILE_SIZE_BYTES,
} from './fileValidation.ts';
import { formatFileSize } from './formatFileSize.ts';

// Helper mock file class
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

describe('fileValidation', () => {
  it('should accept valid MP3 file', () => {
    const file = new MockFile('meeting.mp3', 5 * 1024 * 1024, 'audio/mpeg') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it('should accept valid WAV file', () => {
    const file = new MockFile('recording.wav', 10 * 1024 * 1024, 'audio/wav') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it('should accept valid M4A file', () => {
    const file = new MockFile('session.m4a', 8 * 1024 * 1024, 'audio/mp4') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  it('should reject non-audio PDF file', () => {
    const file = new MockFile('document.pdf', 1024, 'application/pdf') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, false);
    assert.match(res.error!, /Unsupported file type/);
  });

  it('should reject empty file (0 bytes)', () => {
    const file = new MockFile('empty.mp3', 0, 'audio/mpeg') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, false);
    assert.match(res.error!, /file is empty/);
  });

  it('should reject oversized file (>100 MB)', () => {
    const file = new MockFile('huge.mp3', MAX_AUDIO_FILE_SIZE_BYTES + 1, 'audio/mpeg') as unknown as File;
    const res = validateAudioFile(file);
    assert.equal(res.valid, false);
    assert.match(res.error!, /Maximum size is 100 MB/);
  });

  it('should reject null or undefined file', () => {
    const res = validateAudioFile(null);
    assert.equal(res.valid, false);
    assert.match(res.error!, /Please select an audio file/);
  });
});

describe('meetingTitleValidation', () => {
  it('should accept valid title', () => {
    const res = validateMeetingTitle('Weekly Product Review');
    assert.equal(res.valid, true);
  });

  it('should reject empty title', () => {
    const res = validateMeetingTitle('');
    assert.equal(res.valid, false);
    assert.match(res.error!, /Please enter a meeting title/);
  });

  it('should reject whitespace-only title', () => {
    const res = validateMeetingTitle('    ');
    assert.equal(res.valid, false);
    assert.match(res.error!, /Please enter a meeting title/);
  });

  it('should reject title exceeding 200 characters', () => {
    const longTitle = 'a'.repeat(201);
    const res = validateMeetingTitle(longTitle);
    assert.equal(res.valid, false);
    assert.match(res.error!, /200 characters or fewer/);
  });
});

describe('formatFileSize', () => {
  it('formats byte sizes correctly', () => {
    assert.equal(formatFileSize(0), '0 B');
    assert.equal(formatFileSize(500), '500 B');
    assert.equal(formatFileSize(1024), '1 KB');
    assert.equal(formatFileSize(10 * 1024 * 1024), '10 MB');
    assert.equal(formatFileSize(12.4 * 1024 * 1024), '12.4 MB');
  });
});
