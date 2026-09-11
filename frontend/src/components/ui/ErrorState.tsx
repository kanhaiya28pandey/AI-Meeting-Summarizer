import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <Card
      padding="lg"
      className={className}
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        borderColor: 'var(--status-error-border)',
        backgroundColor: 'var(--status-error-bg)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#fee2e2',
          color: 'var(--status-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <AlertCircle size={26} aria-hidden="true" />
      </div>

      <h3
        style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--status-error-text)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.925rem',
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          marginBottom: onRetry ? '1.5rem' : 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Card>
  );
};
