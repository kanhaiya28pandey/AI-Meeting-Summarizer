import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListFilter } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export const Meetings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="My Meetings"
        description="View, browse, and manage all your transcribed and analyzed meetings."
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/')}
          >
            New Meeting
          </Button>
        }
      />

      <EmptyState
        icon={<ListFilter size={28} />}
        title="No meetings found"
        description="You haven't uploaded any meeting recordings yet. Upload an audio file to automatically transcribe and analyze it."
        action={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/')}
          >
            Upload Your First Meeting
          </Button>
        }
      />
    </div>
  );
};
