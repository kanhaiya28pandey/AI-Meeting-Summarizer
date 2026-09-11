import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname === '/meetings') return 'My Meetings';
    if (location.pathname.startsWith('/meetings/')) return 'Meeting Details';
    if (location.pathname === '/settings') return 'Settings';
    return 'Page';
  };

  const pageTitle = getPageTitle();

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
          aria-label="Open navigation menu"
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
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              display: 'none',
            }}
            className="desktop-breadcrumb"
          >
            AI Meeting Summarizer /
          </span>
          <span
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {pageTitle}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary-text)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={13} />
          <span>Gemini AI</span>
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
        @media (min-width: 1024px) {
          .desktop-breadcrumb {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
};
