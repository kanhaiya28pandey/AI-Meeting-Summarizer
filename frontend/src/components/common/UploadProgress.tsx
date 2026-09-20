import type { FC } from 'react';
import { Loader2 } from 'lucide-react';

export interface UploadProgressProps {
  progress: number;
}

export const UploadProgress: FC<UploadProgressProps> = ({ progress }) => {
  const isServerProcessing = progress >= 100;

  return (
    <div
      style={{
        marginTop: '1.25rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border)',
      }}
      aria-live="polite"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--primary)' }} />
          {isServerProcessing ? 'Processing meeting on server...' : 'Uploading audio...'}
        </span>
        <span style={{ color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
          {progress}%
        </span>
      </div>

      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress"
        style={{
          width: '100%',
          height: '8px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.2s ease-in-out',
          }}
        />
      </div>

      {isServerProcessing && (
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
          }}
        >
          Audio upload complete. The backend is running AI neural transcription and meeting analysis. Please wait...
        </p>
      )}
    </div>
  );
};
