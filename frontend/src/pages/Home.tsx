import React, { useEffect } from 'react';
import { UploadCloud, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { UploadCard } from '../components/common/UploadCard';

export const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'AI Meeting Summarizer';
  }, []);

  const featureSteps = [
    {
      step: '01',
      title: 'Upload Recording',
      desc: 'Drop in your meeting recording in MP3, WAV, M4A, MP4, or MOV format.',
      icon: <UploadCloud size={20} color="#6366f1" />,
    },
    {
      step: '02',
      title: 'AI Transcription',
      desc: 'Speech-to-text converts meeting audio into verbatim text with timestamps.',
      icon: <Mic size={20} color="#8b5cf6" />,
    },
    {
      step: '03',
      title: 'Intelligent Analysis',
      desc: 'Neural AI models extract a concise summary, key decisions, and takeaways.',
      icon: <Sparkles size={20} color="#6366f1" />,
    },
    {
      step: '04',
      title: 'Actionable Insights',
      desc: 'Review structured meeting notes and track deliverables and deadlines.',
      icon: <CheckCircle2 size={20} color="#10b981" />,
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="home-badge">
          <Sparkles size={13} />
          <span>AI MEETING SUMMARIZER</span>
        </div>
        <h1 className="home-title">
          Turn Meetings into Action
        </h1>
        <p className="home-subtitle">
          Transform meeting audio and video into clear executive summaries, key decisions, and verbatim transcripts.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="home-upload-section">
        <UploadCard />
      </div>

      {/* Feature Boxes below Analyze Meeting */}
      <div className="home-features-section">
        <div className="home-features-grid">
          {featureSteps.map((s) => (
            <Card key={s.step} padding="md" className="home-feature-card">
              <div className="home-feature-card-header">
                <div className="home-feature-icon-box">
                  {s.icon}
                </div>
                <span className="home-feature-step">{s.step}</span>
              </div>
              <h3 className="home-feature-title">{s.title}</h3>
              <p className="home-feature-desc">{s.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      <style>{`
        .home-container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 0.5rem 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .home-hero {
          text-align: center;
          margin-top: 0;
          margin-bottom: 1rem;
        }

        .home-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.22rem 0.75rem;
          border-radius: var(--radius-full);
          background-color: var(--primary-light);
          color: var(--primary-text);
          font-size: 0.725rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }

        .home-title {
          font-size: clamp(1.85rem, 3.4vw, 2.45rem);
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 0.4rem;
        }

        .home-subtitle {
          font-size: clamp(0.925rem, 1.4vw, 1.05rem);
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 680px;
          margin: 0 auto;
        }

        .home-upload-section {
          margin-bottom: 1.15rem;
        }

        .home-features-section {
          margin-top: 0.25rem;
        }

        .home-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }

        .home-feature-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          background-color: var(--bg-surface);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }

        .home-feature-card:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
        }

        .home-feature-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.6rem;
        }

        .home-feature-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background-color: var(--primary-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .home-feature-step {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }

        .home-feature-title {
          font-size: 0.925rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
          line-height: 1.25;
        }

        .home-feature-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }

        @media (max-width: 900px) {
          .home-features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
          }
        }

        @media (max-width: 560px) {
          .home-features-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          .home-container {
            padding: 0 0.25rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
