import type { FC } from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import type { MeetingStatus } from '../../types/meeting';
import {
  PROCESSING_STAGES,
  STAGE_ORDER,
  type StageDefinition,
} from '../../utils/processingStages';

export type { StageDefinition };
export { PROCESSING_STAGES, STAGE_ORDER };

export interface ProcessingStatusProps {
  status: MeetingStatus;
  title?: string;
  className?: string;
}

export const ProcessingStatus: FC<ProcessingStatusProps> = ({
  status,
  title,
  className = '',
}) => {
  const currentIndex = STAGE_ORDER.indexOf(status);
  const isFailed = status === 'FAILED';

  // Find the active stage definition or fallback
  const currentStageDef = PROCESSING_STAGES.find((s) => s.status === status);

  return (
    <Card
      padding="lg"
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isFailed ? 'var(--status-error)' : 'var(--primary)',
            marginBottom: '0.35rem',
          }}
        >
          {!isFailed && status !== 'COMPLETED' && (
            <Loader2 size={14} className="animate-spin" />
          )}
          <span>{isFailed ? 'Processing Failed' : status === 'COMPLETED' ? 'Processing Complete' : 'Processing in Progress'}</span>
        </div>

        {title && (
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
        )}

        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            marginTop: '0.25rem',
          }}
          aria-live="polite"
        >
          {isFailed
            ? "We couldn't finish processing this meeting recording."
            : currentStageDef?.description || 'Your meeting is being processed.'}
        </p>
      </div>

      {/* Stage Timeline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'relative',
          paddingLeft: '0.5rem',
        }}
      >
        {PROCESSING_STAGES.map((stage, idx) => {
          let stageState: 'completed' | 'current' | 'pending' | 'failed' = 'pending';

          if (isFailed) {
            stageState = 'failed';
          } else if (idx < currentIndex || status === 'COMPLETED') {
            stageState = 'completed';
          } else if (idx === currentIndex) {
            stageState = 'current';
          }

          return (
            <div
              key={stage.status}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                position: 'relative',
              }}
            >
              {/* Connector line between steps */}
              {idx < PROCESSING_STAGES.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '26px',
                    left: '12px',
                    width: '2px',
                    bottom: '-12px',
                    backgroundColor:
                      stageState === 'completed'
                        ? 'var(--status-success)'
                        : 'var(--border)',
                    transition: 'background-color 0.3s ease',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Status Icon */}
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  backgroundColor:
                    stageState === 'completed'
                      ? 'var(--status-success-bg)'
                      : stageState === 'current'
                      ? 'var(--primary-light)'
                      : 'var(--bg-canvas)',
                  color:
                    stageState === 'completed'
                      ? 'var(--status-success)'
                      : stageState === 'current'
                      ? 'var(--primary)'
                      : 'var(--text-muted)',
                  border: `1px solid ${
                    stageState === 'completed'
                      ? 'var(--status-success-border)'
                      : stageState === 'current'
                      ? 'var(--primary)'
                      : 'var(--border)'
                  }`,
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                }}
              >
                {stageState === 'completed' ? (
                  <CheckCircle2 size={16} />
                ) : stageState === 'current' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isFailed ? (
                  <AlertCircle size={14} style={{ color: 'var(--status-error)' }} />
                ) : (
                  <Circle size={10} fill="currentColor" />
                )}
              </div>

              {/* Stage Text */}
              <div style={{ paddingTop: '2px' }}>
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: stageState === 'current' ? 600 : 500,
                    color:
                      stageState === 'completed'
                        ? 'var(--text-primary)'
                        : stageState === 'current'
                        ? 'var(--primary)'
                        : 'var(--text-muted)',
                  }}
                >
                  {stage.label}
                </div>
                {stageState === 'current' && (
                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.2rem',
                    }}
                  >
                    {stage.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Waiting Reassurance Banner */}
      {!isFailed && status !== 'COMPLETED' && (
        <div
          style={{
            marginTop: '1.75rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Your meeting is being processed.
          </span>{' '}
          This may take a few minutes depending on the recording length. You can keep this page open while we work.
        </div>
      )}
    </Card>
  );
};
