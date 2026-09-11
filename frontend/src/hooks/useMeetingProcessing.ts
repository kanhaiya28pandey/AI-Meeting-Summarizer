import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/apiError';
import type { Meeting } from '../types/meeting';
import {
  isProcessingStatus,
  PROCESSING_POLL_INTERVAL,
  IN_PROGRESS_STATUSES,
} from '../utils/processingStages';

export { isProcessingStatus, PROCESSING_POLL_INTERVAL, IN_PROGRESS_STATUSES };

export interface UseMeetingProcessingResult {
  meeting: Meeting | null;
  loading: boolean;
  error: string | null;
  isProcessing: boolean;
  refetch: () => Promise<void>;
}

export function useMeetingProcessing(
  meetingId: string | undefined,
  pollInterval: number = PROCESSING_POLL_INTERVAL
): UseMeetingProcessingResult {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const consecutiveErrorsRef = useRef<number>(0);

  const fetchMeeting = useCallback(async (): Promise<void> => {
    if (!meetingId) {
      setLoading(false);
      setError('Meeting ID is missing');
      return;
    }

    try {
      const data = await api.getMeetingById(meetingId);
      consecutiveErrorsRef.current = 0;
      setMeeting(data);
      setError(null);
      setLoading(false);
    } catch (err: unknown) {
      consecutiveErrorsRef.current += 1;
      const friendly = getFriendlyErrorMessage(err);
      if (consecutiveErrorsRef.current >= 3) {
        setError(friendly);
      }
      setLoading(false);
    }
  }, [meetingId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;

    async function poll() {
      if (!meetingId) {
        setLoading(false);
        setError('Meeting ID is missing');
        return;
      }

      try {
        const data = await api.getMeetingById(meetingId);
        if (!isActive) return;

        consecutiveErrorsRef.current = 0;
        setMeeting(data);
        setError(null);
        setLoading(false);

        if (isProcessingStatus(data.status)) {
          timer = setTimeout(poll, pollInterval);
        }
      } catch (err: unknown) {
        if (!isActive) return;

        consecutiveErrorsRef.current += 1;
        const friendly = getFriendlyErrorMessage(err);
        if (consecutiveErrorsRef.current >= 3) {
          setError(friendly);
        }
        setLoading(false);

        // Keep polling for up to 5 consecutive errors if already tracking
        if (consecutiveErrorsRef.current < 5) {
          timer = setTimeout(poll, pollInterval * 1.5);
        }
      }
    }

    poll();

    return () => {
      isActive = false;
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [meetingId, pollInterval]);

  return {
    meeting,
    loading,
    error,
    isProcessing: isProcessingStatus(meeting?.status),
    refetch: fetchMeeting,
  };
}
