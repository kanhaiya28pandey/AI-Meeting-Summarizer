import type React from 'react';
import { Upload, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { UploadCard } from '../components/common/UploadCard';

export const Home: React.FC = () => {
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
      desc: 'Gemini 3.5 Transcribe converts speech to accurate text with timestamps.',
      icon: <Mic size={20} style={{ color: '#8b5cf6' }} />,
    },
    {
      step: '3',
      title: 'Intelligent Analysis',
      desc: 'Gemini extracts concise summaries, key decisions, and action items.',
      icon: <Sparkles size={20} style={{ color: '#ec4899' }} />,
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
      <PageHeader
        title="Turn Meetings into Action"
        description="Upload your meeting audio or video to generate automated transcripts, executive summaries, and action items powered by Gemini AI."
      />

      {/* Upload Zone Placeholder */}
      <div style={{ marginBottom: '3rem' }}>
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
