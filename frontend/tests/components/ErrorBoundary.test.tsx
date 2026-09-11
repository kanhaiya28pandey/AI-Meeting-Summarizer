import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/common/ErrorBoundary';

const BombComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Simulated runtime render crash with confidential token secret_xyz');
  }
  return <div>Normal View</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Normal View</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal View')).toBeInTheDocument();
  });

  it('catches render error, displays user-friendly fallback, and suppresses sensitive stack trace', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BombComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/we couldn't display this page correctly/i)).toBeInTheDocument();

    expect(screen.queryByText(/secret_xyz/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Simulated runtime render crash/i)).not.toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();

    spy.mockRestore();
  });
});
