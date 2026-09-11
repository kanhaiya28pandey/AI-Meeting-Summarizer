import type { FC, MouseEvent } from 'react';
import { ArrowRight, Trash2, HardDrive, Calendar, Clock } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';
import { formatAudioFormat, getCardSummaryPreview } from '../../utils/meetingDisplay';

interface MeetingCardProps {
  meeting: Meeting;
  onView: (id: string) => void;
  onDelete: (meeting: Meeting) => void;
  isDeleting?: boolean;
}

export const MeetingCard: FC<MeetingCardProps> = ({
  meeting,
  onView,
  onDelete,
  isDeleting = false,
}) => {
  const title = meeting.title && meeting.title.trim() ? meeting.title.trim() : 'Untitled Meeting';
  const summaryPreview = getCardSummaryPreview(meeting);
  const audioFormat = formatAudioFormat(meeting.fileType);
  const formattedDuration = formatDuration(meeting.duration);
  const hasDuration = formattedDuration !== '—';

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(meeting);
  };

  const handleCardClick = () => {
    onView(meeting.id);
  };

  return (
    <Card
      padding="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '260px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
    >
      {/* Top Section: Title & Status */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={title}
          >
            {title}
          </h3>
          <Badge status={meeting.status} />
        </div>

        {/* Metadata Row: Filename, Format, Date, Duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          {/* Filename */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              maxWidth: '180px',
            }}
            title={meeting.originalFileName}
          >
            <HardDrive size={13} style={{ flexShrink: 0 }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {meeting.originalFileName || 'recording'}
            </span>
          </div>

          <span style={{ color: 'var(--border)' }}>•</span>

          {/* Format */}
          <span
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border)',
              padding: '0.1rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {audioFormat}
          </span>

          <span style={{ color: 'var(--border)' }}>•</span>

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={13} style={{ flexShrink: 0 }} />
            <span>{formatDate(meeting.createdAt)}</span>
          </div>

          {/* Duration (if available) */}
          {hasDuration && (
            <>
              <span style={{ color: 'var(--border)' }}>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} style={{ flexShrink: 0 }} />
                <span>{formattedDuration}</span>
              </div>
            </>
          )}
        </div>

        {/* Summary Preview Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.25rem',
            fontSize: '0.86rem',
            lineHeight: 1.5,
            color: meeting.status === 'COMPLETED' && meeting.summary ? 'var(--text-secondary)' : 'var(--text-muted)',
            fontStyle: meeting.status === 'COMPLETED' && meeting.summary ? 'normal' : 'italic',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: '4.2rem',
          }}
        >
          {summaryPreview}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
        }}
      >
        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDeleteClick}
          aria-label={`Delete meeting ${title}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            fontSize: '0.82rem',
            transition: 'color 0.15s ease, background-color 0.15s ease',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--status-error)';
            e.currentTarget.style.backgroundColor = 'var(--status-error-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRight size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onView(meeting.id);
          }}
          aria-label={`View meeting ${title}`}
        >
          View Meeting
        </Button>
      </div>
    </Card>
  );
};
