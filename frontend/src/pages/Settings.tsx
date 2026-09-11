import React from 'react';
import { Server, Cpu, Database, Info } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';

export const Settings: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Review system parameters, connected microservices, and environment status."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        {/* API Backend Card */}
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Server size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Spring Boot Backend</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            The primary REST API gateway managing persistence, transactions, file storage, and pipeline orchestration.
          </p>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Configured API Base URL:</span>
            <code style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{apiBaseUrl}</code>
          </div>
        </Card>

        {/* AI Service Card */}
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Cpu size={20} style={{ color: '#8b5cf6' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>FastAPI AI Microservice</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Handles audio processing, Gemini Files API uploads, audio transcription, and structured meeting intelligence.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              fontSize: '0.85rem',
            }}
          >
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Transcription Engine</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Gemini 3.5 Transcribe</div>
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Analysis & Extraction Engine</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Gemini 2.5 Flash</div>
            </div>
          </div>
        </Card>

        {/* Database Card */}
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Database size={20} style={{ color: '#10b981' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Database & Storage</h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            PostgreSQL relational database with JPA/Hibernate entity mappings for meetings, transcripts, and action items.
          </p>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            <Info size={16} style={{ color: 'var(--status-neutral)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              Persistence schema: PostgreSQL 16 • Table: <code>meetings</code>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
