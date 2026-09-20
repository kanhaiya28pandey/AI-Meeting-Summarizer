import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  AlertCircle
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
      style={{
        minHeight: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          overflow: 'hidden',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Side: SaaS Brand & Value Showcase */}
        <div
          style={{
            flex: '1 1 420px',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            color: '#ffffff',
            padding: '3.25rem 2.75rem',
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
              top: '-20%',
              right: '-20%',
              width: '380px',
              height: '380px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Top Brand Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                }}
              >
                <Sparkles size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  AI Meeting
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.04em' }}>
                  Summarizer
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '1rem', color: '#ffffff' }}>
              Turn Conversations into Actionable Clarity.
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.25rem' }}>
              Upload audio or video recordings and let Gemini AI generate instant executive summaries, person-by-person transcripts, and assigned action items.
            </p>

            {/* Feature Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Users size={17} color="#a5b4fc" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    Person-by-Person Diarization
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Clean transcripts divided speaker-by-speaker with accurate timestamps
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Zap size={17} color="#6ee7b7" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    Gemini Flash Intelligence
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Synthesizes key decisions, deadlines, and action checklists instantly
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={17} color="#fcd34d" />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
                    Private &amp; Secure Multi-Tenant
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    All uploaded files and meeting summaries remain strictly confidential to you
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>✨ Powered by Google Gemini AI</span>
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>100% Free • No Credit Card</span>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div
          style={{
            flex: '1 1 460px',
            padding: '3.5rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              Account Access
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Sign in with your registered <strong>Email</strong> or <strong>@username</strong>
            </p>
          </div>

          {isAnalyzeRedirect && pendingUpload && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <Sparkles size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Meeting Selected: </span>
                <span>"{pendingUpload.title}"</span>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Sign in to immediately start AI transcription and analysis.
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                borderRadius: '12px',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                color: 'var(--status-error-text)',
                fontSize: '0.825rem',
              }}
            >
              <AlertCircle size={18} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Authentication Error</div>
                <div style={{ marginTop: '2px', opacity: 0.9 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Identifier Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Address or Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. name@example.com or kanhaiya_pandey"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="login-input"
                />
                <Mail
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                💡 Tip: You can enter either your email address or your unique @username.
              </span>
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="login-input"
                />
                <Lock
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                fontSize: '0.925rem',
                fontWeight: 700,
                color: '#ffffff',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
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
                      width: '18px',
                      height: '18px',
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
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Sign Up Redirect */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
                paddingTop: '1.25rem',
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
        @media (max-width: 860px) {
          .auth-split-card {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Login;
