import { useEffect, type FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ProcessingStatus } from '../components/common/ProcessingStatus';
import { MeetingHeader } from '../components/meeting/MeetingHeader';
import { MeetingResults } from '../components/meeting/MeetingResults';
import { useMeetingProcessing } from '../hooks/useMeetingProcessing';

export const MeetingDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Meeting Details | AI Meeting Summarizer';
  }, []);

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
      {/* Top Header & Metadata Bar */}
      <MeetingHeader
        meeting={meeting}
        onBack={() => navigate('/meetings')}
        onNewUpload={() => navigate('/')}
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
                  We couldn't finish processing this meeting
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--status-error-text)',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                  }}
                >
                  Your meeting record is still saved, but the processing pipeline encountered an error.
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

      {/* 3. Completed State: Executive Summary, Decisions, Actions, Transcript */}
      {meeting.status === 'COMPLETED' && (
        <MeetingResults meeting={meeting} />
      )}
    </div>
  );
};
