import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, Plus, FileText, Calendar, HardDrive } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ProcessingStatus } from '../components/common/ProcessingStatus';
import { useMeetingProcessing } from '../hooks/useMeetingProcessing';

export const MeetingDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { meeting, loading, error, isProcessing } = useMeetingProcessing(id);

  if (loading && !meeting) {
    return (
      <div style={{ padding: '3rem 1rem' }}>
        <LoadingState message="Retrieving meeting details..." />
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate('/meetings')}
          >
            Back to Meetings
          </Button>
        </div>
        <ErrorState
          title="Meeting Not Found"
          message={error}
          onRetry={() => navigate('/meetings')}
        />
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <div>
      {/* Top Navigation */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/meetings')}
        >
          Back to Meetings
        </Button>
      </div>

      <PageHeader
        title={meeting.title || 'Meeting Details'}
        description={`Record ID: ${meeting.id}`}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Badge status={meeting.status} />
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={() => navigate('/')}
            >
              New Upload
            </Button>
          </div>
        }
      />

      {/* 1. Active Processing Timeline */}
      {isProcessing && (
        <div style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
          <ProcessingStatus
            status={meeting.status}
            title={meeting.title}
          />
        </div>
      )}

      {/* 2. Failure State */}
      {meeting.status === 'FAILED' && (
        <div style={{ maxWidth: '720px', margin: '0 auto 2rem' }}>
          <Card
            padding="lg"
            style={{
              borderColor: 'var(--status-error-border)',
              backgroundColor: 'var(--status-error-bg)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#fee2e2',
                  color: 'var(--status-error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--status-error-text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  Processing Failed
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--status-error-text)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}
                >
                  We couldn't complete automated transcription or analysis for this recording. Your meeting record remains saved, but processing did not finish.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/meetings')}
                  >
                    Back to My Meetings
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/')}
                  >
                    Upload Another File
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <ProcessingStatus
            status="FAILED"
            title={meeting.title}
          />
        </div>
      )}

      {/* 3. Completed State */}
      {meeting.status === 'COMPLETED' && (
        <div style={{ maxWidth: '840px', margin: '0 auto 2rem' }}>
          <Card
            padding="lg"
            style={{
              borderColor: 'var(--status-success-border)',
              backgroundColor: 'var(--status-success-bg)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#d1fae5',
                  color: 'var(--status-success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle size={24} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--status-success-text)',
                  }}
                >
                  Processing Complete!
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--status-success-text)',
                    marginTop: '0.2rem',
                  }}
                >
                  Your meeting summary, key decisions, and action items have been successfully generated.
                </p>
              </div>
            </div>
          </Card>

          {/* Meeting Metadata Summary Card */}
          <Card padding="lg" style={{ marginBottom: '1.5rem' }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}
            >
              Meeting Overview
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <HardDrive size={14} />
                  <span>Original File</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {meeting.originalFileName || 'recording.mp3'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <Calendar size={14} />
                  <span>Created</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {meeting.createdAt ? new Date(meeting.createdAt).toLocaleDateString() : 'Today'}
                </div>
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <FileText size={14} />
                  <span>Format</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {meeting.fileType || 'audio/mpeg'}
                </div>
              </div>
            </div>

            {/* Quick summary snippet if available */}
            {meeting.summary && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Summary Preview
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {meeting.summary}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
