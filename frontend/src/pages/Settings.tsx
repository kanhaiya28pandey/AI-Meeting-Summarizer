import React, { useEffect } from 'react';
import { Sparkles, FileAudio, Cpu, Server, Database } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';

export const Settings: React.FC = () => {
  useEffect(() => {
    document.title = 'Settings | AI Meeting Summarizer';
  }, []);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Application information, supported media formats, and system parameters."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px' }}>
        {/* Application Info */}
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Application</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>General software specifications</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Product Name</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Meeting Summarizer</div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Release Version</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>1.0.0 (Production Ready)</div>
            </div>
          </div>
        </Card>

        {/* Media & Upload Constraints */}
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#eef2ff',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileAudio size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Media &amp; Upload</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Supported formats and file constraints</p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Supported Media</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>MP3, WAV, M4A, MP4, MOV</div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Maximum Upload Size</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>100 MB</div>
            </div>
          </div>
        </Card>

        {/* Processing Architecture */}
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ecfdf5',
                color: 'var(--status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>Processing Pipeline</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Execution model and intelligence microservices</p>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Meetings are processed asynchronously. The upload endpoint registers the meeting immediately, and an in-process worker transitions through transcription, Gemini AI analysis, and PostgreSQL persistence.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.825rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Server size={15} color="var(--primary)" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Backend: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Spring Boot 4</span>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Cpu size={15} color="#8b5cf6" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>AI Service: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>FastAPI + Gemini</span>
              </div>
            </div>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Database size={15} color="var(--status-success)" />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Storage: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PostgreSQL</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
