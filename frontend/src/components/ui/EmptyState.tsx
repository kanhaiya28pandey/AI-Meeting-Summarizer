import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Card } from './Card';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <Card
      padding="lg"
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        paddingTop: '3.5rem',
        paddingBottom: '3.5rem',
        borderStyle: 'dashed',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        {icon || <FolderOpen size={28} />}
      </div>

      <h3
        style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
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
          marginBottom: action ? '1.5rem' : 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {action && <div>{action}</div>}
    </Card>
  );
};
