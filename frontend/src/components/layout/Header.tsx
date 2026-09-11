import React from 'react';
import { Menu, Bot } from 'lucide-react';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Open sidebar menu"
          className="mobile-menu-trigger"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            AI Meeting Summarizer
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-text)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Bot size={14} />
          <span>Gemini 3.5 AI</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          header {
            padding: 0 1rem !important;
          }
          .mobile-menu-trigger {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
