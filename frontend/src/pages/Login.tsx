import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  AlertCircle,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { login, isAuthenticated, pendingUpload } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAnalyzeRedirect = searchParams.get('redirect') === 'analyze';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    document.title = 'Sign In | AI Meeting Summarizer';
    if (isAuthenticated) {
      if (isAnalyzeRedirect && pendingUpload) {
        navigate('/?autoAnalyze=true', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, isAnalyzeRedirect, pendingUpload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your email address or @username');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      if (isAnalyzeRedirect && pendingUpload) {
        navigate('/?autoAnalyze=true', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email/username or password. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="auth-page-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas)',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="auth-split-card"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: 'calc(100vh - var(--header-height) - 1.5rem)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: Professional SaaS Value Card */}
        <div
          className="auth-hero-panel"
          style={{
            flex: '1 1 380px',
            background: 'linear-gradient(145deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
            color: '#ffffff',
            padding: '2rem 2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-15%',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Top Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                  flexShrink: 0,
                }}
              >
                <Cpu size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  AI Meeting
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.04em' }}>
                  Summarizer
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem', color: '#ffffff' }}>
              Turn Conversations into Actionable Clarity.
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Transform audio and video recordings into executive summaries, multi-speaker transcripts, and clear decision items.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    backgroundColor: 'rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users size={15} color="#a5b4fc" />
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                    Speaker Diarization
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    Precise conversational breakdown with timestamps
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={15} color="#6ee7b7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                    Executive Intelligence
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    Extracts key decisions, deadlines, and action checklists
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={15} color="#fcd34d" />
                </div>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                    Multi-Tenant Privacy
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    All meeting archives remain strictly confidential to your account
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>🔒 Bank-Grade Encryption</span>
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>Private Workspace</span>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div
          style={{
            flex: '1 1 420px',
            padding: '2.25rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                fontSize: '0.725rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.45rem',
              }}
            >
              Account Access
            </span>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Sign in with your registered <strong>Email</strong> or <strong>@username</strong>
            </p>
          </div>

          {isAnalyzeRedirect && pendingUpload && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.7rem 0.85rem',
                marginBottom: '1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
              }}
            >
              <Sparkles size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Meeting Selected: </span>
                <span>"{pendingUpload.title}"</span>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Sign in to immediately run AI transcription and analysis.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                padding: '0.7rem 0.85rem',
                marginBottom: '1rem',
                borderRadius: '10px',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                color: 'var(--status-error-text)',
                fontSize: '0.8rem',
              }}
            >
              <AlertCircle size={16} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Authentication Error</div>
                <div style={{ marginTop: '1px', opacity: 0.9 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {/* Identifier Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Address or Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. alex@company.com or alex_morgan"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.35rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  className="login-input"
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.35rem 0.65rem 2.35rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                  className="login-input"
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.35rem',
                width: '100%',
                padding: '0.7rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
              className="hover:opacity-95"
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Sign Up Redirect */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                marginTop: '0.4rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              Don't have an account yet?{' '}
              <Link
                to={isAnalyzeRedirect ? '/signup?redirect=analyze' : '/signup'}
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
                className="hover:underline"
              >
                Create an account for free →
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .login-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
          background-color: var(--bg-surface) !important;
        }
        .auth-page-container {
          min-height: calc(100vh - var(--header-height));
          height: calc(100vh - var(--header-height));
          padding: 0.75rem 1rem;
          overflow: hidden;
        }
        @media (max-width: 800px) {
          .auth-page-container {
            height: auto !important;
            min-height: calc(100vh - var(--header-height)) !important;
            overflow-y: auto !important;
            padding: 1.25rem 1rem !important;
            align-items: flex-start !important;
          }
          .auth-split-card {
            flex-direction: column !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 16px !important;
          }
          .auth-hero-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Login;
