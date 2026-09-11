import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, ApiClientError } from '../../src/services/api';
import { mockCompletedMeeting } from '../fixtures/meetingFixtures';

describe('API Client Service Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getMeetings performs GET /api/meetings and returns json response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [mockCompletedMeeting],
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.getMeetings();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/meetings',
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Sprint Retrospective');
  });

  it('getMeetingById encodes ID and performs GET /api/meetings/:id', async () => {
    const meetingId = 'test-id-123';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCompletedMeeting,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await api.getMeetingById(meetingId);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:8080/api/meetings/${meetingId}`,
      expect.any(Object)
    );
    expect(result.id).toBe(mockCompletedMeeting.id);
  });

  it('deleteMeeting sends DELETE request and handles 204 No Content', async () => {
    const meetingId = 'delete-target-id';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', fetchMock);

    await api.deleteMeeting(meetingId);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:8080/api/meetings/${meetingId}`,
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('handles network disconnection throwing ApiClientError with status 0', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.getMeetings()).rejects.toThrowError(ApiClientError);
    await expect(api.getMeetings()).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('Unable to connect to the server'),
    });
  });

  it('handles backend 404 error with ApiClientError containing status and message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Meeting not found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.getMeetingById('non-existent')).rejects.toMatchObject({
      status: 404,
      message: 'Meeting not found',
    });
  });
});
