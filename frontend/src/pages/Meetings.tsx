import { useEffect, useState, useMemo, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, Lock, LogIn, UserPlus } from 'lucide-react';
import type { Meeting } from '../types/meeting';
import { api } from '../services/api';
import { getFriendlyErrorMessage } from '../utils/apiError';
import { PageHeader } from '../components/ui/PageHeader';
import { Button, Card, Skeleton, ErrorState, useToast } from '../components/ui';
import { MeetingList } from '../components/meeting/MeetingList';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { MeetingFilters, type DateFilterPreset } from '../components/meeting/MeetingFilters';
import { useAuth } from '../hooks/useAuth';

export const Meetings: FC = () => {
  const navigate = useNavigate();
  const { success: toastSuccess } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'My Meetings | AI Meeting Summarizer';
  }, []);

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete flow state
  const [deleteTarget, setDeleteTarget] = useState<Meeting | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMeetings();
      setMeetings(data || []);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setLoading(false);
      setMeetings([]);
      return;
    }

    api.getMeetings()
      .then((data) => {
        if (active) {
          setMeetings(data || []);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(getFriendlyErrorMessage(err));
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleOpenDelete = (meeting: Meeting) => {
    setDeleteError(null);
    setDeleteTarget(meeting);
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    const targetId = deleteTarget.id;

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteMeeting(targetId);
      setMeetings((prev) => prev.filter((m) => m.id !== targetId));
      setDeleteTarget(null);
      toastSuccess?.('Meeting deleted successfully');
    } catch (err) {
      setDeleteError(
        typeof err === 'object' && err !== null && 'message' in err
          ? String(err.message)
          : "Couldn't delete this meeting. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleViewMeeting = (id: string) => {
    navigate(`/meetings/${id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setStatusFilter('all');
  };

  // Filtered meetings logic
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // 1. Search Query (title, summary, transcript)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = meeting.title?.toLowerCase().includes(q);
        const inSummary = meeting.summary?.toLowerCase().includes(q);
        const inTranscript = meeting.transcript?.toLowerCase().includes(q);
        if (!inTitle && !inSummary && !inTranscript) {
          return false;
        }
      }

      // 2. Date Filter
      if (dateFilter !== 'all' && meeting.createdAt) {
        const meetingDate = new Date(meeting.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          const isToday =
            meetingDate.getDate() === now.getDate() &&
            meetingDate.getMonth() === now.getMonth() &&
            meetingDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === 'week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (meetingDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'month') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (meetingDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'this_month') {
          const isThisMonth =
            meetingDate.getMonth() === now.getMonth() &&
            meetingDate.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'COMPLETED' && meeting.status !== 'COMPLETED') return false;
        if (statusFilter === 'FAILED' && meeting.status !== 'FAILED') return false;
        if (statusFilter === 'PROCESSING' && (meeting.status === 'COMPLETED' || meeting.status === 'FAILED')) return false;
      }

      return true;
    });
  }, [meetings, searchQuery, dateFilter, statusFilter]);

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="My Meetings"
        description="Your processed meetings, summaries, transcripts, and action items."
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                icon={<RefreshCw size={15} className={loading ? 'animate-spin' : ''} />}
                onClick={handleRefresh}
                disabled={loading}
                title="Refresh meeting list"
                aria-label="Refresh meeting list"
              >
                Refresh
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => navigate('/')}
            >
              New Meeting
            </Button>
          </div>
        }
      />

      {/* Unauthenticated Notification Banner */}
      {!isAuthenticated && (
        <Card
          padding="lg"
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 1.5rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Lock size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Sign in to view your meetings
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              maxWidth: '460px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.5,
            }}
          >
            All uploaded and analyzed meetings are securely saved to individual accounts. Sign in or create an account to access, search, and manage your private meeting archive.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              size="md"
              icon={<LogIn size={16} />}
              onClick={() => navigate('/login', { state: { from: { pathname: '/meetings' } } })}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<UserPlus size={16} />}
              onClick={() => navigate('/signup', { state: { from: { pathname: '/meetings' } } })}
            >
              Create Free Account
            </Button>
          </div>
        </Card>
      )}

      {/* Delete Error Inline Alert */}
      {deleteError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.5rem',
            backgroundColor: 'var(--status-error-bg)',
            border: '1px solid var(--status-error-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-error-text)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--status-error-text)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Meeting Filters & Search (Only shown if user has meetings or active search) */}
      {isAuthenticated && !loading && (meetings.length > 0 || searchQuery || dateFilter !== 'all' || statusFilter !== 'all') && (
        <MeetingFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onClearFilters={handleClearFilters}
          totalMeetingsCount={meetings.length}
          filteredMeetingsCount={filteredMeetings.length}
        />
      )}

      {/* Loading Skeletons */}
      {isAuthenticated && loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
          aria-label="Loading meetings"
        >
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              padding="lg"
              style={{
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <div>
                <Skeleton width="65%" height="22px" style={{ marginBottom: '0.75rem' }} />
                <Skeleton width="45%" height="15px" style={{ marginBottom: '1.25rem' }} />
                <Skeleton width="100%" height="45px" borderRadius="var(--radius-md)" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <Skeleton width="80px" height="24px" borderRadius="var(--radius-full)" />
                <Skeleton width="65px" height="28px" borderRadius="var(--radius-md)" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isAuthenticated && !loading && error && (
        <ErrorState
          title="Couldn't load your meetings"
          message={error}
          onRetry={handleRefresh}
        />
      )}

      {/* Meeting Collection */}
      {isAuthenticated && !loading && !error && (
        <MeetingList
          meetings={filteredMeetings}
          onView={handleViewMeeting}
          onDelete={handleOpenDelete}
          deletingMeetingId={deleting ? deleteTarget?.id : null}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete meeting?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title || 'Untitled Meeting'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this meeting? This action cannot be undone.'
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete Meeting'}
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
export default Meetings;
