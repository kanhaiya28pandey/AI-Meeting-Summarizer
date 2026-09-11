import React, { useEffect } from 'react';
import { Upload, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { UploadCard } from '../components/common/UploadCard';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'AI Meeting Summarizer';
  }, []);

  const workflowSteps = [
    {
      step: '1',
      title: 'Upload Recording',
      desc: 'Drop in your meeting recording in MP3, WAV, M4A, MP4, or MOV format.',
      icon: <Upload size={20} style={{ color: '#6366f1' }} />,
    },
    {
      step: '2',
      title: 'AI Transcription',
      desc: 'Speech-to-text converts meeting audio into formatted text with timestamps.',
      icon: <Mic size={20} style={{ color: '#8b5cf6' }} />,
    },
    {
      step: '3',
      title: 'Intelligent Analysis',
      desc: 'Gemini AI extracts a concise summary, key decisions, and action items.',
      icon: <Sparkles size={20} style={{ color: '#6366f1' }} />,
    },
    {
      step: '4',
      title: 'Actionable Insights',
      desc: 'Review structured meeting notes and track owners and deadlines.',
      icon: <CheckCircle2 size={20} style={{ color: '#10b981' }} />,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem', paddingTop: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-text)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={12} />
          <span>AI MEETING SUMMARIZER</span>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1rem',
          }}
        >
          Turn Meetings into Action
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '620px',
            margin: '0 auto',
          }}
        >
          Transform meeting recordings into clear summaries, decisions, action items, and searchable transcripts.
        </p>
      </div>

      {/* Upload Zone */}
      <div style={{ marginBottom: '3.5rem' }}>
        <UploadCard />
      </div>

      {/* How it Works Section */}
      <div>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}
        >
          How It Works
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {workflowSteps.map((s) => (
            <Card key={s.step} padding="md" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {s.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  0{s.step}
                </span>
              </div>

              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {s.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
