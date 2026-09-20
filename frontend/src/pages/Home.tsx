import React, { useEffect } from 'react';
import { FileAudio, Sparkles, CheckCircle2 } from 'lucide-react';
import { UploadCard } from '../components/common/UploadCard';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'AI Meeting Summarizer';
  }, []);

  const featurePillars = [
    {
      icon: <FileAudio size={16} color="#6366f1" />,
      title: 'Verbatim Transcription',
      subtitle: 'Accurate speech-to-text & speakers',
    },
    {
      icon: <Sparkles size={16} color="#8b5cf6" />,
      title: 'Executive Intelligence',
      subtitle: 'Key decisions & strategic summary',
    },
    {
      icon: <CheckCircle2 size={16} color="#10b981" />,
      title: 'Action Deliverables',
      subtitle: 'Clear owners & assigned deadlines',
    },
  ];

  return (
    <div className="home-viewport-container">
      {/* Hero Section */}
      <div className="home-hero-section">
        <div className="home-hero-badge">
          <Sparkles size={13} />
          <span>AI MEETING SUMMARIZER</span>
        </div>
        <h1 className="home-hero-title">
          Turn Meetings into Action
        </h1>
        <p className="home-hero-subtitle">
          Transform meeting audio and video into clear executive summaries, key decisions, and verbatim transcripts.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="home-upload-wrapper">
        <UploadCard />
      </div>

      {/* Sleek Enterprise Feature Strip */}
      <div className="home-feature-strip">
        {featurePillars.map((pillar, idx) => (
          <div key={idx} className="home-feature-item">
            <div className="home-feature-icon-wrapper">
              {pillar.icon}
            </div>
            <div className="home-feature-text">
              <span className="home-feature-title">{pillar.title}</span>
              <span className="home-feature-sub">{pillar.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .home-viewport-container {
          max-width: 920px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.25rem 1rem;
          min-height: calc(100vh - var(--header-height) - 1rem);
          box-sizing: border-box;
        }

        .home-hero-section {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .home-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.7rem;
          border-radius: var(--radius-full);
          background-color: var(--primary-light);
          color: var(--primary-text);
          font-size: 0.725rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.65rem;
        }

        .home-hero-title {
          font-size: clamp(1.75rem, 3.5vw, 2.35rem);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 0.5rem;
        }

        .home-hero-subtitle {
          font-size: clamp(0.875rem, 1.5vw, 1rem);
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 580px;
          margin: 0 auto;
        }

        .home-upload-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .home-upload-wrapper > * {
          width: 100%;
        }

        .home-feature-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .home-feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.85rem;
          background-color: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;
        }

        .home-feature-item:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .home-feature-icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background-color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .home-feature-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .home-feature-title {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .home-feature-sub {
          font-size: 0.725rem;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .home-viewport-container {
            min-height: auto;
            padding: 1rem 0.5rem;
          }
          .home-feature-strip {
            grid-template-columns: 1fr;
            gap: 0.625rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
