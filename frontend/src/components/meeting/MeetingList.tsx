import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListFilter } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { MeetingCard } from './MeetingCard';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

interface MeetingListProps {
  meetings: Meeting[];
  onView: (id: string) => void;
  onDelete: (meeting: Meeting) => void;
  deletingMeetingId?: string | null;
}

export const MeetingList: FC<MeetingListProps> = ({
  meetings,
  onView,
  onDelete,
  deletingMeetingId,
}) => {
  const navigate = useNavigate();

  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={<ListFilter size={32} />}
        title="No meetings yet"
        description="Upload your first meeting to generate a transcript, summary, decisions, and action items."
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/')}
          >
            Upload Meeting
          </Button>
        }
      />
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
        alignItems: 'stretch',
      }}
    >
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onView={onView}
          onDelete={onDelete}
          isDeleting={deletingMeetingId === meeting.id}
        />
      ))}
    </div>
  );
};
