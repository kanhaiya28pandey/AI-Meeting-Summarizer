import { useState, type FC } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../ui';

interface MeetingSummaryProps {
  summary: string | null | undefined;
}

export const MeetingSummary: FC<MeetingSummaryProps> = ({ summary }) => {
  const [copied, setCopied] = useState(false);
  const { success: toastSuccess } = useToast();

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toastSuccess('Summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(false);
    }
  };

  const hasSummary = summary && summary.trim().length > 0;

  return (
    <Card
      padding="lg"
      style={{
        marginBottom: '1.75rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Section Header */}
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
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Executive Summary
          </h2>
        </div>

        {hasSummary && (
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
            onClick={handleCopy}
            title="Copy summary to clipboard"
            aria-label="Copy summary to clipboard"
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>

      {/* Content */}
      {hasSummary ? (
        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {summary}
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
          No summary available for this meeting.
        </div>
      )}
    </Card>
  );
};
