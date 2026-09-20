import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  AlertCircle
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
  const [customUsername, setCustomUsername] = useState('');
  const [isUsernameEdited, setIsUsernameEdited] = useState(false);
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

  const previewUsername = fullName.trim()
    ? fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    : 'username';

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!isUsernameEdited) {
      const generated = val.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      setCustomUsername(generated);
    }
  };

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
    if (customUsername.trim() && !/^[a-zA-Z0-9_]{3,30}$/.test(customUsername.trim())) {
      setError('Username handle must be 3-30 characters containing letters, numbers, or underscores.');
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
      await signup({
        fullName: fullName.trim(),
        username: customUsername.trim() || undefined,
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
      setError(err?.message || 'Failed to create account. Please check your information and try again.');
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
          maxWidth: '1080px',
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
              top: '-15%',
              right: '-15%',
              width: '400px',
              height: '400px',
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
              Create Your Private Workspace.
            </h2>
            <p style={{ fontSize: '0.925rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem' }}>
              Keep your meeting recordings, speaker transcripts, and executive notes strictly isolated to your own secure account.
            </p>

            {/* Dynamic Auto-Username Preview Card */}
            <div
              style={{
                padding: '1.15rem 1.25rem',
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                marginBottom: '2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Sparkles size={16} color="#a5b4fc" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Auto Unique Username
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                @{previewUsername}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem', lineHeight: 1.4 }}>
                A unique @username is generated automatically from your name. You can use it to log in anytime!
              </p>
            </div>

            {/* Feature Bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>No OTP verification required (Zero SMS delays)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Audio &amp; Video support up to 100 MB</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="#34d399" />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>Full search and date filtering in My Meetings</span>
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
            <span>🔒 Bank-Grade BCrypt Encryption</span>
            <span style={{ color: '#6ee7b7', fontWeight: 600 }}>100% Confidential</span>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div
          style={{
            flex: '1 1 480px',
            padding: '3rem 2.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div style={{ marginBottom: '1.75rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--status-success)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              Free Registration
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Get Started in Seconds
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Create your account to start uploading, summarizing, and organizing your meetings.
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
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            >
              <Sparkles size={20} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--status-success)' }}>Meeting Selected: </span>
                <span>"{pendingUpload.title}"</span>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Create your free account to immediately start AI transcription and analysis.
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
                marginBottom: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'var(--status-error-bg)',
                border: '1px solid var(--status-error-border)',
                color: 'var(--status-error-text)',
                fontSize: '0.825rem',
              }}
            >
              <AlertCircle size={18} style={{ color: 'var(--status-error)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontWeight: 600 }}>Registration Error</div>
                <div style={{ marginTop: '2px', opacity: 0.9 }}>{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Full Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  value={fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder="e.g. Kanhaiya Pandey"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.4rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="signup-input"
                />
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            {/* Username Handle Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Login Username Handle
                </label>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  Auto-suggested or custom
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => {
                    setIsUsernameEdited(true);
                    setCustomUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                  }}
                  placeholder={previewUsername}
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.4rem',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="signup-input"
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  @
                </span>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                You can use this unique @username or your email to sign in.
              </div>
            </div>

            {/* Email Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem 0.7rem 2.4rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  className="signup-input"
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            {/* 2 Fields for Mobile: Country Code Text/List + 10-Digit Number */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Mobile Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Any Country Code + 10 Digits)</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Flexible Country Code Text Input with Suggestions */}
                <div style={{ width: '130px', flexShrink: 0 }}>
                  <input
                    type="text"
                    required
                    list="country-codes-list"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="+91"
                    title="Type any country code (e.g. +91, +1, +44) or choose from list"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      outline: 'none',
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

                {/* 10-digit mobile number */}
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    style={{
                      width: '100%',
                      padding: '0.7rem 1rem 0.7rem 2.4rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                    className="signup-input"
                  />
                  <Phone
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                ✨ Type any country code directly. No SMS OTP code needed.
              </span>
            </div>

            {/* Passwords in Responsive Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    style={{
                      width: '100%',
                      padding: '0.7rem 2.2rem 0.7rem 0.85rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                    className="signup-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '12px',
                      outline: 'none',
                    }}
                    className="signup-input"
                  />
                </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Login Redirect */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '0.75rem',
                paddingTop: '1.15rem',
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
        @media (max-width: 860px) {
          .auth-split-card {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Signup;
