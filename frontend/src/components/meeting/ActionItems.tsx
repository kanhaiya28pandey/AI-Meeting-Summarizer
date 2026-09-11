import type { FC } from 'react';
import { ListChecks, User, Calendar } from 'lucide-react';
import type { ActionItem } from '../../types/meeting';
import { Card } from '../ui/Card';

interface ActionItemsProps {
  actionItems: ActionItem[] | null | undefined;
}

export const ActionItems: FC<ActionItemsProps> = ({ actionItems }) => {
  const items = actionItems || [];
  const hasItems = items.length > 0;

  return (
    <Card
      padding="lg"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ListChecks size={16} />
          </div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Action Items
          </h2>
        </div>

        {hasItems && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#fef3c7',
              color: '#b45309',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {items.length} {items.length === 1 ? 'task' : 'tasks'}
          </span>
        )}
      </div>

      {/* Action Items List */}
      {hasItems ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flex: 1,
          }}
        >
          {items.map((item, index) => {
            const hasOwner = Boolean(item.owner && item.owner.trim().length > 0);
            const hasDeadline = Boolean(item.deadline && item.deadline.trim().length > 0);

            return (
              <div
                key={index}
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg-canvas)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {/* Task text */}
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                  }}
                >
                  {item.task}
                </div>

                {/* Metadata badges (Owner, Deadline) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    fontSize: '0.78rem',
                  }}
                >
                  {/* Owner */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: hasOwner ? 'var(--primary-text)' : 'var(--text-muted)',
                      backgroundColor: hasOwner ? 'var(--primary-light)' : 'transparent',
                      padding: hasOwner ? '0.15rem 0.5rem' : '0',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <User size={13} />
                    <span>Owner: {hasOwner ? item.owner : 'Not specified'}</span>
                  </div>

                  {/* Deadline */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: hasDeadline ? '#92400e' : 'var(--text-muted)',
                      backgroundColor: hasDeadline ? '#fffbeb' : 'transparent',
                      padding: hasDeadline ? '0.15rem 0.5rem' : '0',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <Calendar size={13} />
                    <span>Deadline: {hasDeadline ? item.deadline : 'Not specified'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            margin: 'auto 0',
          }}
        >
          No action items were identified for this meeting.
        </div>
      )}
    </Card>
  );
};
