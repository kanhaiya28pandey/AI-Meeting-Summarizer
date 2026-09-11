import React from 'react';
import { UploadCloud, Music } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface UploadCardProps {
  className?: string;
  onPlaceholderClick?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  className = '',
  onPlaceholderClick,
}) => {
  return (
    <Card
      padding="lg"
      className={className}
      style={{
        border: '2px dashed var(--border)',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        cursor: 'default',
        transition: 'border-color 0.2s ease',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <UploadCloud size={32} />
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        Upload Meeting Audio
      </h3>

      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}
      >
        Drag and drop your meeting audio recording here, or click below to browse files from your computer.
      </p>

      <Button
        variant="primary"
        size="lg"
        icon={<UploadCloud size={18} />}
        onClick={onPlaceholderClick}
        style={{ marginBottom: '1.25rem' }}
      >
        Select Audio File
      </Button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <Music size={14} />
        <span>Supported formats: MP3, WAV, M4A • Max file size: 100 MB</span>
      </div>
    </Card>
  );
};
