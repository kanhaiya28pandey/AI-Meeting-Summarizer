import { ApiClientError } from '../types/api.ts';

export interface AppError {
  message: string;
  status?: number;
}

/**
 * Converts any API or network error into a user-friendly message.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please make sure the backend is running and try again.';
    }

    if (error.status === 413) {
      return 'The audio file is too large. Maximum size is 100 MB.';
    }

    if (error.status === 415) {
      return 'Unsupported file format. Please upload an MP3, WAV, or M4A audio file.';
    }

    if (error.status === 400) {
      return error.details?.message || error.details?.error || 'Invalid audio file or meeting request.';
    }

    if (error.status === 502 || error.status === 503) {
      return 'The AI processing service is temporarily unavailable. Please try again in a moment.';
    }

    if (error.status >= 500) {
      return 'The meeting could not be processed by the server. Please try again.';
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please make sure the backend is running and try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
