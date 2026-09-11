import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: description ? '0.25rem' : 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {action}
        </div>
      )}
    </div>
  );
};
