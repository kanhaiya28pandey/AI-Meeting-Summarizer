import type { FC } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, FileAudio, HardDrive } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';

interface MeetingHeaderProps {
  meeting: Meeting;
  onBack?: () => void;
  onNewUpload?: () => void;
}

export const MeetingHeader: FC<MeetingHeaderProps> = ({
  meeting,
  onBack,
  onNewUpload,
}) => {
  return (
    <header style={{ marginBottom: '2rem' }}>
      {/* Back button */}
      {onBack && (
        <div style={{ marginBottom: '1rem' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            aria-label="Back to meetings list"
          >
            Back to Meetings
          </Button>
        </div>
      )}

      {/* Main Title Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {meeting.title || 'Untitled Meeting'}
            </h1>
            <Badge status={meeting.status} />
          </div>
        </div>

        {onNewUpload && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={onNewUpload}
          >
            New Upload
          </Button>
        )}
      </div>

      {/* Metadata Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}
      >
        {/* File Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            minWidth: 0,
            maxWidth: '280px',
          }}
          title={meeting.originalFileName}
        >
          <HardDrive size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {meeting.originalFileName || 'recording.mp3'}
          </span>
        </div>

        {/* Divider */}
        <span style={{ color: 'var(--border)' }}>•</span>

        {/* Audio Format */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <FileAudio size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>
            {meeting.fileType ? meeting.fileType.toUpperCase() : 'AUDIO'}
          </span>
        </div>

        {/* Divider */}
        <span style={{ color: 'var(--border)' }}>•</span>

        {/* Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Clock size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span>Duration: <strong>{formatDuration(meeting.duration)}</strong></span>
        </div>

        {/* Divider */}
        <span style={{ color: 'var(--border)' }}>•</span>

        {/* Created Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Calendar size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span>Recorded: <strong>{formatDate(meeting.createdAt)}</strong></span>
        </div>
      </div>
    </header>
  );
};
