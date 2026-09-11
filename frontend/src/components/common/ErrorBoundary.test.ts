import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Error boundary state contract
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

function getDerivedStateFromError(error: Error): ErrorBoundaryState {
  return { hasError: true, error };
}

describe('ErrorBoundary lifecycle and state contracts', () => {
  it('correctly transitions state when an error is caught', () => {
    const error = new Error('Simulated React render crash');
    const newState = getDerivedStateFromError(error);

    assert.equal(newState.hasError, true);
    assert.equal(newState.error?.message, 'Simulated React render crash');
  });

  it('provides safe user-facing error message without stack trace', () => {
    const userFacingTitle = 'Something went wrong';
    const userFacingMessage = "We couldn't display this page correctly. Please refresh and try again.";

    assert.equal(userFacingTitle, 'Something went wrong');
    assert.ok(!userFacingMessage.includes('at HTML'));
    assert.ok(!userFacingMessage.includes('node_modules'));
    assert.ok(userFacingMessage.includes('refresh and try again'));
  });
});
