import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useMeetingProcessing } from '../../src/hooks/useMeetingProcessing';
import { api } from '../../src/services/api';
import {
  mockProcessingMeeting,
  mockCompletedMeeting,
  mockFailedMeeting,
} from '../fixtures/meetingFixtures';

describe('useMeetingProcessing Hook & Polling Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('polls during in-progress statuses and terminates polling when COMPLETED', async () => {
    const meetingId = 'test-uuid-1';
    const transcribingMeeting = { ...mockProcessingMeeting, status: 'TRANSCRIBING' as const };
    const completedMeeting = { ...mockCompletedMeeting, id: meetingId, status: 'COMPLETED' as const };

    const getSpy = vi
      .spyOn(api, 'getMeetingById')
      .mockResolvedValueOnce(transcribingMeeting)
      .mockResolvedValueOnce(completedMeeting);

    const { result } = renderHook(() => useMeetingProcessing(meetingId, 1000));

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.meeting?.status).toBe('TRANSCRIBING');
    expect(result.current.isProcessing).toBe(true);

    // Fast-forward to trigger second poll
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.meeting?.status).toBe('COMPLETED');
    expect(result.current.isProcessing).toBe(false);

    // Advance more time to confirm no further polls are scheduled
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('terminates polling immediately when status is FAILED', async () => {
    const meetingId = 'test-uuid-2';
    const failedMeeting = { ...mockFailedMeeting, id: meetingId, status: 'FAILED' as const };

    const getSpy = vi.spyOn(api, 'getMeetingById').mockResolvedValueOnce(failedMeeting);

    const { result } = renderHook(() => useMeetingProcessing(meetingId, 1000));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.meeting?.status).toBe('FAILED');
    expect(result.current.isProcessing).toBe(false);

    // Advance time - should not poll again
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('cleans up timeout and stops polling on unmount', async () => {
    const meetingId = 'test-uuid-3';
    const getSpy = vi
      .spyOn(api, 'getMeetingById')
      .mockResolvedValue(mockProcessingMeeting);

    const { unmount } = renderHook(() => useMeetingProcessing(meetingId, 1000));

    await act(async () => {
      await Promise.resolve();
    });

    expect(getSpy).toHaveBeenCalledTimes(1);

    // Unmount before next tick
    unmount();

    // Advance time after unmount
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    // Should not have polled after unmount
    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
