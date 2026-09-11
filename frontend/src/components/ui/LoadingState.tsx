import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
      }}
    >
      <Loader2
        size={36}
        className="animate-spin"
        style={{ color: 'var(--primary)' }}
        aria-hidden="true"
      />
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}
      >
        {message}
      </p>
    </div>
  );
};
