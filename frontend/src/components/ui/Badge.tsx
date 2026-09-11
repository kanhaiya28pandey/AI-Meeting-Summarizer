import type React from 'react';
import type { MeetingStatus } from '../../types/meeting';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  status?: MeetingStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  className = '',
  style,
  ...rest
}) => {
  // Resolve status to variant if status is provided
  let effectiveVariant: BadgeVariant = variant || 'neutral';
  let displayText = children;

  if (status) {
    switch (status) {
      case 'COMPLETED':
        effectiveVariant = 'success';
        displayText = displayText || 'Completed';
        break;
      case 'FAILED':
        effectiveVariant = 'error';
        displayText = displayText || 'Failed';
        break;
      case 'TRANSCRIBING':
        effectiveVariant = 'warning';
        displayText = displayText || 'Transcribing';
        break;
      case 'ANALYZING':
        effectiveVariant = 'warning';
        displayText = displayText || 'Analyzing';
        break;
      case 'SAVING':
        effectiveVariant = 'info';
        displayText = displayText || 'Saving';
        break;
      case 'UPLOADED':
        effectiveVariant = 'info';
        displayText = displayText || 'Uploaded';
        break;
      default:
        effectiveVariant = 'neutral';
        displayText = displayText || status;
    }
  }

  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    success: {
      backgroundColor: 'var(--status-success-bg)',
      color: 'var(--status-success-text)',
      border: '1px solid var(--status-success-border)',
    },
    warning: {
      backgroundColor: 'var(--status-warning-bg)',
      color: 'var(--status-warning-text)',
      border: '1px solid var(--status-warning-border)',
    },
    error: {
      backgroundColor: 'var(--status-error-bg)',
      color: 'var(--status-error-text)',
      border: '1px solid var(--status-error-border)',
    },
    info: {
      backgroundColor: 'var(--status-info-bg)',
      color: 'var(--status-info-text)',
      border: '1px solid var(--status-info-border)',
    },
    neutral: {
      backgroundColor: 'var(--status-neutral-bg)',
      color: 'var(--status-neutral-text)',
      border: '1px solid var(--status-neutral-border)',
    },
  };

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1,
    padding: '0.25rem 0.625rem',
    borderRadius: 'var(--radius-full)',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    ...variantStyles[effectiveVariant],
    ...style,
  };

  return (
    <span style={badgeStyles} className={className} {...rest}>
      {displayText}
    </span>
  );
};
