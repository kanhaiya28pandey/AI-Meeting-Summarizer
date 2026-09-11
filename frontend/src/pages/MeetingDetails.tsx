import type React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const MeetingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

      <PageHeader
        title={`Meeting Details`}
        description={`Viewing record for meeting ID: ${id || 'unknown'}`}
      />

      <Card padding="lg" style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            color: 'var(--primary)',
          }}
        >
          <FileText size={24} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Meeting #{id}
          </h2>
        </div>

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          This is the meeting details view foundation. In subsequent phases, this page will display the full meeting transcript with speaker diarization, executive summary, key decisions, and interactive action items persisted in PostgreSQL.
        </p>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-info-bg)',
            border: '1px solid var(--status-info-border)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <Clock size={20} style={{ color: 'var(--status-info-text)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', color: 'var(--status-info-text)' }}>
            <strong>Phase 10 Foundation:</strong> Real-time meeting detail fetching and rendering will be activated when the UI connects to the Spring Boot REST API.
          </div>
        </div>
      </Card>
    </div>
  );
};
