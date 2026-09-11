import type { FC, HTMLAttributes } from 'react';
import type { MeetingStatus } from '../../types/meeting';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: MeetingStatus;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, className = '', style, ...rest }) => {
  let label = 'Unknown';
  let bgColor = 'var(--status-neutral-bg)';
  let textColor = 'var(--status-neutral-text)';
  let borderColor = 'var(--status-neutral-border)';
  let dotColor = 'var(--status-neutral)';

  switch (status) {
    case 'UPLOADED':
      label = 'Uploading';
      bgColor = 'var(--status-info-bg)';
      textColor = 'var(--status-info-text)';
      borderColor = 'var(--status-info-border)';
      dotColor = 'var(--status-info)';
      break;
    case 'TRANSCRIBING':
      label = 'Transcribing';
      bgColor = 'var(--status-warning-bg)';
      textColor = 'var(--status-warning-text)';
      borderColor = 'var(--status-warning-border)';
      dotColor = 'var(--status-warning)';
      break;
    case 'ANALYZING':
      label = 'Analyzing';
      bgColor = 'var(--status-warning-bg)';
      textColor = 'var(--status-warning-text)';
      borderColor = 'var(--status-warning-border)';
      dotColor = 'var(--status-warning)';
      break;
    case 'SAVING':
      label = 'Saving';
      bgColor = 'var(--status-info-bg)';
      textColor = 'var(--status-info-text)';
      borderColor = 'var(--status-info-border)';
      dotColor = 'var(--status-info)';
      break;
    case 'COMPLETED':
      label = 'Ready';
      bgColor = 'var(--status-success-bg)';
      textColor = 'var(--status-success-text)';
      borderColor = 'var(--status-success-border)';
      dotColor = 'var(--status-success)';
      break;
    case 'FAILED':
      label = 'Failed';
      bgColor = 'var(--status-error-bg)';
      textColor = 'var(--status-error-text)';
      borderColor = 'var(--status-error-border)';
      dotColor = 'var(--status-error)';
      break;
  }

  return (
    <span
      className={`status-badge status-badge-${status.toLowerCase()} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1,
        padding: '0.3rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '6px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: dotColor,
        }}
      />
      <span>{label}</span>
    </span>
  );
};
