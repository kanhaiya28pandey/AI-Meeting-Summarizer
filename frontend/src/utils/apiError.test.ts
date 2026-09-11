import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getFriendlyErrorMessage } from './apiError.ts';
import { ApiClientError } from '../types/api.ts';

describe('getFriendlyErrorMessage', () => {
  it('handles network failure / connection refused (status 0)', () => {
    const error = new ApiClientError('Failed to fetch', 0);
    const msg = getFriendlyErrorMessage(error);
    assert.match(msg, /Unable to connect to the server/);
  });

  it('handles 413 Payload Too Large', () => {
    const error = new ApiClientError('Payload Too Large', 413);
    const msg = getFriendlyErrorMessage(error);
    assert.match(msg, /Maximum size is 100 MB/);
  });

  it('handles 415 Unsupported Media Type', () => {
    const error = new ApiClientError('Unsupported Media Type', 415);
    const msg = getFriendlyErrorMessage(error);
    assert.match(msg, /Unsupported file format/);
  });

  it('handles 400 Bad Request with custom message', () => {
    const error = new ApiClientError('Bad Request', 400, {
      message: 'Audio file is required',
    });
    const msg = getFriendlyErrorMessage(error);
    assert.equal(msg, 'Audio file is required');
  });

  it('handles 502 / 503 AI service unavailable', () => {
    const error = new ApiClientError('Service Unavailable', 503);
    const msg = getFriendlyErrorMessage(error);
    assert.match(msg, /temporarily unavailable/);
  });

  it('handles generic 500 error', () => {
    const error = new ApiClientError('Internal Server Error', 500);
    const msg = getFriendlyErrorMessage(error);
    assert.match(msg, /The meeting could not be processed by the server/);
  });
});
