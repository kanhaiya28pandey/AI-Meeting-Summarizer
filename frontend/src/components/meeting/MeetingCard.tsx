import type { FC, MouseEvent } from 'react';
import { ArrowRight, Trash2, HardDrive, Calendar, Clock, Sparkles, FileAudio, FileVideo } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
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

  const isVideo =
    (meeting.fileType && meeting.fileType.toLowerCase().includes('video')) ||
    (meeting.originalFileName && (
      meeting.originalFileName.toLowerCase().endsWith('.mp4') ||
      meeting.originalFileName.toLowerCase().endsWith('.mov')
    ));

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(meeting);
  };

  const handleCardClick = () => {
    onView(meeting.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="meeting-card-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '275px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)',
        padding: '1.25rem 1.35rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
        e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(15, 23, 42, 0.05)';
      }}
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
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              margin: 0,
              flex: 1,
            }}
            title={title}
          >
            {title}
          </h3>
          <div style={{ flexShrink: 0 }}>
            <Badge status={meeting.status} />
          </div>
        </div>

        {/* Metadata Row: Filename, Format, Date, Duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            fontSize: '0.76rem',
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
              maxWidth: '160px',
            }}
            title={meeting.originalFileName}
          >
            <HardDrive size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}
            >
              {meeting.originalFileName || 'recording'}
            </span>
          </div>

          <span style={{ color: 'var(--border)' }}>•</span>

          {/* Media Format Tag */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: isVideo ? 'rgba(59, 130, 246, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              border: `1px solid ${isVideo ? 'rgba(59, 130, 246, 0.25)' : 'rgba(99, 102, 241, 0.22)'}`,
              padding: '0.12rem 0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: isVideo ? '#2563eb' : '#4f46e5',
            }}
          >
            {isVideo ? <FileVideo size={11} /> : <FileAudio size={11} />}
            <span>{audioFormat}</span>
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

        {/* Professional Summary Briefing Box */}
        <div
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.025)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.25rem',
            fontSize: '0.84rem',
            lineHeight: 1.55,
            color: meeting.status === 'COMPLETED' && meeting.summary ? 'var(--text-secondary)' : 'var(--text-muted)',
            fontStyle: meeting.status === 'COMPLETED' && meeting.summary ? 'normal' : 'italic',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: '4.4rem',
          }}
        >
          {meeting.status === 'COMPLETED' && meeting.summary && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                marginBottom: '0.3rem',
              }}
            >
              <Sparkles size={11} />
              <span>Executive Briefing</span>
            </div>
          )}
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
            padding: '0.35rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: '1px solid transparent',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'all 0.15s ease',
            cursor: isDeleting ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--status-error)';
            e.currentTarget.style.backgroundColor = 'var(--status-error-bg)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>

        <Button
          variant="secondary"
          size="sm"
          icon={<ArrowRight size={14} />}
          onClick={(e) => {
            e.stopPropagation();
            onView(meeting.id);
          }}
          aria-label={`View meeting ${title}`}
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          View Meeting
        </Button>
      </div>
    </div>
  );
};

export default MeetingCard;
