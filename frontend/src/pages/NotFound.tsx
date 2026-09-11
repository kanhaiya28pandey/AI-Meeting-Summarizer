import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <Card
        padding="lg"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          paddingTop: '3.5rem',
          paddingBottom: '3.5rem',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--status-neutral-bg)',
            color: 'var(--status-neutral)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <HelpCircle size={32} />
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'var(--primary)',
            lineHeight: 1,
            marginBottom: '0.5rem',
            letterSpacing: '-0.03em',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.75rem',
            lineHeight: 1.5,
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Button
          variant="primary"
          icon={<Home size={16} />}
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </Card>
    </div>
  );
};
