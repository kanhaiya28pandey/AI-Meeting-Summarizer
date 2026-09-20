import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
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

const COMMON_COUNTRIES = [
  { code: '+91', label: '+91 (India)' },
  { code: '+1', label: '+1 (USA & Canada)' },
  { code: '+44', label: '+44 (United Kingdom)' },
  { code: '+61', label: '+61 (Australia)' },
  { code: '+971', label: '+971 (United Arab Emirates)' },
  { code: '+65', label: '+65 (Singapore)' },
  { code: '+49', label: '+49 (Germany)' },
  { code: '+33', label: '+33 (France)' },
  { code: '+81', label: '+81 (Japan)' },
  { code: '+86', label: '+86 (China)' },
  { code: '+82', label: '+82 (South Korea)' },
  { code: '+966', label: '+966 (Saudi Arabia)' },
  { code: '+974', label: '+974 (Qatar)' },
  { code: '+968', label: '+968 (Oman)' },
  { code: '+965', label: '+965 (Kuwait)' },
  { code: '+973', label: '+973 (Bahrain)' },
  { code: '+60', label: '+60 (Malaysia)' },
  { code: '+62', label: '+62 (Indonesia)' },
  { code: '+63', label: '+63 (Philippines)' },
  { code: '+64', label: '+64 (New Zealand)' },
  { code: '+353', label: '+353 (Ireland)' },
  { code: '+31', label: '+31 (Netherlands)' },
  { code: '+41', label: '+41 (Switzerland)' },
  { code: '+46', label: '+46 (Sweden)' },
  { code: '+47', label: '+47 (Norway)' },
  { code: '+45', label: '+45 (Denmark)' },
  { code: '+34', label: '+34 (Spain)' },
  { code: '+39', label: '+39 (Italy)' },
  { code: '+351', label: '+351 (Portugal)' },
  { code: '+48', label: '+48 (Poland)' },
  { code: '+43', label: '+43 (Austria)' },
  { code: '+32', label: '+32 (Belgium)' },
  { code: '+55', label: '+55 (Brazil)' },
  { code: '+52', label: '+52 (Mexico)' },
  { code: '+54', label: '+54 (Argentina)' },
  { code: '+56', label: '+56 (Chile)' },
  { code: '+57', label: '+57 (Colombia)' },
  { code: '+234', label: '+234 (Nigeria)' },
  { code: '+20', label: '+20 (Egypt)' },
  { code: '+27', label: '+27 (South Africa)' },
  { code: '+254', label: '+254 (Kenya)' },
  { code: '+92', label: '+92 (Pakistan)' },
  { code: '+880', label: '+880 (Bangladesh)' },
  { code: '+977', label: '+977 (Nepal)' },
  { code: '+94', label: '+94 (Sri Lanka)' },
  { code: '+90', label: '+90 (Turkey)' },
  { code: '+7', label: '+7 (Russia / Kazakhstan)' },
];

export const Signup: React.FC = () => {
  const { signup, isAuthenticated, pendingUpload } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isAnalyzeRedirect = searchParams.get('redirect') === 'analyze';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Create Account | AI Meeting Summarizer';
    if (isAuthenticated) {
      if (isAnalyzeRedirect && pendingUpload) {
        navigate('/?autoAnalyze=true', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, isAnalyzeRedirect, pendingUpload]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    let formattedCode = countryCode.trim();
    if (!formattedCode.startsWith('+')) {
      formattedCode = '+' + formattedCode;
    }
    if (formattedCode.length < 2 || formattedCode.length > 5) {
      setError('Please enter a valid country code (e.g. +91, +1).');
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Backend automatically generates unique username from fullName!
      await signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        countryCode: formattedCode,
        mobileNumber: cleanMobile,
        password,
      });
      if (isAnalyzeRedirect && pendingUpload) {
        navigate('/?autoAnalyze=true', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        height: 'calc(100vh - var(--header-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-canvas)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        className="auth-split-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: 'calc(100vh - var(--header-height) - 1.5rem)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 45px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Left Side: SaaS Value & Features Card */}
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
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-15%',
              width: '320px',
              height: '320px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  flexShrink: 0,
                }}
              >
                <Cpu size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  AI Meeting
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6ee7b7', letterSpacing: '0.04em' }}>
                  Summarizer
                </div>
              </div>
            </div>

            {/* Headline */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '0.65rem', color: '#ffffff' }}>
              Join Free &amp; Supercharge Your Meetings.
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Create your account to unlock private cloud meeting storage, speaker breakdown, and automated summaries.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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
                    Instant AI Synthesis
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    Executive summaries, key decisions, and prioritized tasks
                  </div>
                </div>
              </div>

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
                    Speaker Attribution
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    Conversations separated person-by-person with timing
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
                    Auto-Generated @Username
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.3 }}>
                    A unique handle is created automatically to use for instant login
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
            <span>🔒 Confidential &amp; Encrypted</span>
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>100% Free Workspace</span>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div
          style={{
            flex: '1 1 480px',
            padding: '2rem 2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ marginBottom: '1.1rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--status-success)',
                fontSize: '0.725rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.45rem',
              }}
            >
              Quick Registration
            </span>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Create Your Account
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Your unique @username handle will be automatically generated upon signup.
            </p>
          </div>

          {isAnalyzeRedirect && pendingUpload && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.65rem 0.85rem',
                marginBottom: '0.9rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
              }}
            >
              <Sparkles size={18} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>Meeting Selected: </span>
                <span>"{pendingUpload.title}"</span>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  Sign up to immediately run AI transcription and analysis.
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
                padding: '0.65rem 0.85rem',
                marginBottom: '0.9rem',
                borderRadius: '10px',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                color: 'var(--status-error-text)',
                fontSize: '0.8rem',
              }}
            >
              <AlertCircle size={16} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Registration Error</div>
                <div style={{ marginTop: '1px', opacity: 0.9 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Row 1: Full Name & Email in 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <User
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <Mail
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Mobile Number (Country Code + 10 Digits) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '110px', flexShrink: 0 }}>
                  <input
                    type="text"
                    required
                    list="country-codes-list"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+91"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <datalist id="country-codes-list">
                    {COMMON_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </datalist>
                </div>

                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <Phone
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password & Confirm Password in 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.2rem 0.65rem 2.25rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <Lock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
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
                      right: '0.75rem',
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
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.25rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '10px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    className="signup-input"
                  />
                  <Lock
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Login Redirect */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                marginTop: '0.35rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border)',
              }}
            >
              Already have an account?{' '}
              <Link
                to={isAnalyzeRedirect ? '/login?redirect=analyze' : '/login'}
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
                className="hover:underline"
              >
                Sign in here →
              </Link>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .signup-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
          background-color: var(--bg-surface) !important;
        }
        @media (max-width: 800px) {
          .auth-split-card {
            flex-direction: column !important;
            max-height: 95vh !important;
            overflow-y: auto !important;
          }
          .auth-hero-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Signup;
