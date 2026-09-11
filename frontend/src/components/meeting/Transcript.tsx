import { useState, type FC } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface TranscriptProps {
  transcript: string | null | undefined;
}

export const Transcript: FC<TranscriptProps> = ({ transcript }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const hasTranscript = transcript && transcript.trim().length > 0;

  return (
    <Card
      padding="lg"
      style={{
        marginTop: '1.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f1f5f9',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileText size={16} />
          </div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Full Transcript
          </h2>
        </div>

        {hasTranscript && (
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
            onClick={handleCopy}
            title="Copy entire transcript to clipboard"
            aria-label="Copy entire transcript to clipboard"
          >
            {copied ? 'Copied' : 'Copy Transcript'}
          </Button>
        )}
      </div>

      {/* Transcript Text Body */}
      {hasTranscript ? (
        <div
          style={{
            maxHeight: '480px',
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.92rem',
            lineHeight: 1.7,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {transcript}
        </div>
      ) : (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
          }}
        >
          No transcript available for this meeting.
        </div>
      )}
    </Card>
  );
};
