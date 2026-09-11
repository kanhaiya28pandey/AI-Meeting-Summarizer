import type { FC } from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { Card } from '../ui/Card';

interface KeyDecisionsProps {
  decisions: string[] | null | undefined;
}

export const KeyDecisions: FC<KeyDecisionsProps> = ({ decisions }) => {
  const list = decisions || [];
  const hasDecisions = list.length > 0;

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
              backgroundColor: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={16} />
          </div>
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            Key Decisions
          </h2>
        </div>

        {hasDecisions && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {list.length} {list.length === 1 ? 'decision' : 'decisions'}
          </span>
        )}
      </div>

      {/* List */}
      {hasDecisions ? (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            flex: 1,
          }}
        >
          {list.map((decision, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2
                size={17}
                color="var(--status-success)"
                style={{ flexShrink: 0, marginTop: '0.15rem' }}
              />
              <span style={{ flex: 1 }}>{decision}</span>
            </li>
          ))}
        </ul>
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
          No key decisions were identified for this meeting.
        </div>
      )}
    </Card>
  );
};
