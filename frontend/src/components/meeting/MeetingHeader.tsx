import type { FC } from 'react';
import { ArrowLeft, Plus, Calendar, Clock, FileAudio, HardDrive, FileDown, Printer } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatDate';
import { formatDuration } from '../../utils/formatDuration';
import { exportMeetingToMarkdown, exportMeetingToPdf } from '../../utils/exportMeeting';

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
    <header style={{ marginBottom: '1.75rem' }}>
      {/* Top Navigation & Action Toolbar */}
      <div
        className="no-print meeting-header-top-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={onBack}
              aria-label="Back to meetings list"
            >
              Back to Meetings
            </Button>
          )}
        </div>

        {/* Action Button Group */}
        <div className="meeting-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {meeting.status === 'COMPLETED' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={<FileDown size={15} />}
                onClick={() => exportMeetingToMarkdown(meeting)}
                title="Download meeting summary and transcript as Markdown (.md)"
              >
                Export Markdown
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Printer size={15} />}
                onClick={() => exportMeetingToPdf()}
                title="Print or Save as PDF"
              >
                Export PDF
              </Button>
            </>
          )}

          {onNewUpload && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              onClick={onNewUpload}
            >
              New Upload
            </Button>
          )}
        </div>
      </div>

      {/* Main Title Row - Full width with word-wrap */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(1.35rem, 2.8vw, 1.85rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              margin: 0,
            }}
          >
            {meeting.title || 'Untitled Meeting'}
          </h1>
          <Badge status={meeting.status} />
        </div>
      </div>

      {/* Metadata Bar */}
      <div
        className="meeting-header-metadata-bar"
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
          className="meta-filename"
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
        <span className="meta-bullet" style={{ color: 'var(--border)' }}>•</span>

        {/* Audio Format */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <FileAudio size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>
            {meeting.fileType ? meeting.fileType.toUpperCase() : 'AUDIO'}
          </span>
        </div>

        {/* Divider */}
        <span className="meta-bullet" style={{ color: 'var(--border)' }}>•</span>

        {/* Duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Clock size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span>Duration: <strong>{formatDuration(meeting.duration)}</strong></span>
        </div>

        {/* Divider */}
        <span className="meta-bullet" style={{ color: 'var(--border)' }}>•</span>

        {/* Created Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Calendar size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span>Recorded: <strong>{formatDate(meeting.createdAt)}</strong></span>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .meeting-header-top-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .meeting-header-actions {
            display: grid !important;
            grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)) !important;
            width: 100% !important;
            gap: 0.5rem !important;
          }
          .meeting-header-actions button {
            width: 100% !important;
            justify-content: center !important;
          }
          .meeting-header-metadata-bar {
            gap: 0.65rem !important;
            padding: 0.75rem 0.85rem !important;
          }
          .meta-bullet {
            display: none !important;
          }
          .meta-filename {
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </header>
  );
};
