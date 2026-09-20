import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sparkles, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home';
    if (location.pathname === '/meetings') return 'My Meetings';
    if (location.pathname.startsWith('/meetings/')) return 'Meeting Details';
    if (location.pathname === '/settings' || location.pathname === '/profile') return 'Profile & Settings';
    if (location.pathname === '/login') return 'Sign In';
    if (location.pathname === '/signup') return 'Create Account';
    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
          className="hidden sm:inline-flex"
        >
          <Sparkles size={13} />
          <span>Gemini AI</span>
        </div>

        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/settings"
              title="Profile & Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                textDecoration: 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.15s ease',
              }}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getInitials(user.fullName)}
              </div>
              <div className="hidden md:block text-left">
                <div
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {user.fullName}
                </div>
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--primary)',
                    lineHeight: 1.2,
                  }}
                >
                  @{user.username}
                </div>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--status-error)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-red-500/15"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
              }}
              className="hover:opacity-95"
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </Link>
          </div>
        )}
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
export default Header;
