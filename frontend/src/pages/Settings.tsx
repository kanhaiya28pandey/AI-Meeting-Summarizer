import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
  Sliders,
  FileAudio,
  Cpu,
  Server,
  Database,
  LogIn,
  UserPlus,
  BadgeCheck,
  LogOut
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui';

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

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system'>('profile');

  useEffect(() => {
    document.title = 'Profile & Settings | AI Meeting Summarizer';
  }, []);

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [countryCode, setCountryCode] = useState(user?.countryCode || '+91');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Sync with user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setCountryCode(user.countryCode || '+91');
      setMobileNumber(user.mobileNumber || '');
    }
  }, [user]);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setProfileError('Please provide a valid email address.');
      return;
    }
    if (username.trim() && !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      setProfileError('Username handle must be 3-30 characters containing only letters, numbers, or underscores.');
      return;
    }
    let formattedCode = countryCode.trim();
    if (!formattedCode.startsWith('+')) {
      formattedCode = '+' + formattedCode;
    }
    if (formattedCode.length < 2 || formattedCode.length > 5) {
      setProfileError('Please enter a valid country code (e.g. +91, +1).');
      return;
    }
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setProfileError('Mobile number must be exactly 10 digits.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        username: username.trim() || undefined,
        email: email.trim().toLowerCase(),
        countryCode: formattedCode,
        mobileNumber: cleanMobile,
      });
      setProfileSuccess('Profile credentials updated successfully!');
      toastSuccess?.('Profile credentials updated successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update profile. Please try again.';
      setProfileError(msg);
      toastError?.(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password changed successfully!');
      toastSuccess?.('Password changed successfully');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Please verify current password.';
      setPasswordError(msg);
      toastError?.(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <PageHeader
        title="Profile &amp; Settings"
        description="Manage your account profile, personal credentials, login security, and meeting processing configurations."
      />

      {isAuthenticated && user ? (
        <>
          {/* Executive Profile Hero Banner */}
          <div
            className="settings-hero-banner"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)',
              padding: '2rem 2.25rem',
              color: '#ffffff',
              boxShadow: '0 10px 30px -10px rgba(67, 56, 202, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Decorative Circle */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  flexShrink: 0,
                }}
              >
                {getInitials(user.fullName)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                    {user.fullName}
                  </h2>
                  <span
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    @{user.username}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <BadgeCheck size={14} />
                    Verified User
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={15} color="#a5b4fc" />
                    <span>{user.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} color="#a5b4fc" />
                    <span>{user.countryCode} {user.mobileNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ color: '#94a3b8' }}>Account Identifier</div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>User ID #{user.id}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  toastSuccess?.('Logged out successfully');
                  navigate('/login');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#fca5a5',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                className="hover:bg-red-500/25"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Segmented Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.4rem',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              width: 'fit-content',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <UserIcon size={16} />
              <span>Personal Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'security' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'security' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <KeyRound size={16} />
              <span>Security &amp; Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'system' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'system' ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              <Sliders size={16} />
              <span>System &amp; Preferences</span>
            </button>
          </div>

          {/* TAB 1: Personal Profile */}
          {activeTab === 'profile' && (
            <Card padding="lg" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Personal Profile Information
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      Update your account name, contact mobile number, and login credentials
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <span>@{user.username}</span>
                </div>
              </div>

              {profileError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
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
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--status-success-bg)',
                    border: '1px solid var(--status-success-border)',
                    color: 'var(--status-success-text)',
                    fontSize: '0.825rem',
                  }}
                >
                  <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Full Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        outline: 'none',
                      }}
                      className="settings-input"
                    />
                  </div>

                  {/* Username Handle (Editable) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Username Handle
                      </label>
                      <span style={{ fontSize: '0.725rem', color: 'var(--primary)', fontWeight: 600 }}>Login Identifier</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder={user.username}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.25rem',
                          fontSize: '0.875rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '12px',
                          outline: 'none',
                        }}
                        className="settings-input"
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
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {/* Email Address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        outline: 'none',
                      }}
                      className="settings-input"
                    />
                  </div>

                  {/* 2 Fields for Mobile: Flexible Country Code Text + 10-Digit Number */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Mobile Number <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Country Code + 10 Digits)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ width: '130px', flexShrink: 0 }}>
                        <input
                          type="text"
                          required
                          list="country-codes-settings"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          placeholder="+91"
                          style={{
                            width: '100%',
                            padding: '0.75rem 0.85rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1.5px solid var(--border)',
                            borderRadius: '12px',
                            outline: 'none',
                          }}
                          className="settings-input"
                        />
                        <datalist id="country-codes-settings">
                          {COMMON_COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </datalist>
                      </div>
                      <div style={{ flex: 1 }}>
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
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1.5px solid var(--border)',
                            borderRadius: '12px',
                            outline: 'none',
                          }}
                          className="settings-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={savingProfile}
                    loading={savingProfile}
                    icon={<Save size={16} />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <Card padding="lg" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--status-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Security &amp; Password Credentials
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Keep your account secure with encrypted BCrypt password management
                  </p>
                </div>
              </div>

              {passwordError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
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
                  <AlertCircle size={17} style={{ flexShrink: 0 }} />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--status-success-bg)',
                    border: '1px solid var(--status-success-border)',
                    color: 'var(--status-success-text)',
                    fontSize: '0.825rem',
                  }}
                >
                  <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '650px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.6rem 0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        outline: 'none',
                      }}
                      className="settings-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.6rem 0.75rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '12px',
                          outline: 'none',
                        }}
                        className="settings-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--text-muted)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                        outline: 'none',
                      }}
                      className="settings-input"
                    />
                  </div>
                </div>

                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: 'var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={14} color="var(--primary)" />
                    <span>Password Security Guidelines:</span>
                  </div>
                  <div>• Use at least 8 characters with a mix of letters and numbers</div>
                  <div>• Dual login supported: You can log in using either email or username with this password</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={savingPassword}
                    loading={savingPassword}
                    icon={<Lock size={15} />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 3: System & Preferences */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              {/* Media Constraints */}
              <Card padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileAudio size={19} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Media &amp; File Constraints
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Audio &amp; video formats supported for automatic transcription and summarization
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Supported Formats</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>MP3, WAV, M4A, MP4, MOV</div>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', borderRadius: '12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Maximum File Size</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>100 MB per file</div>
                  </div>
                </div>
              </Card>

              {/* Architecture & AI Pipeline */}
              <Card padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--status-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Cpu size={19} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Connected Intelligence Pipeline
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Microservices and database architecture status
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.825rem' }}>
                  <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Server size={20} color="var(--primary)" />
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>Backend Core</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Spring Boot 3 (Java 21)</div>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Cpu size={20} color="#8b5cf6" />
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>AI Microservice</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>FastAPI + Neural AI Engine</div>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Database size={20} color="var(--status-success)" />
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>Data Persistence</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>PostgreSQL 18</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Account Active Session & Logout Card */}
          <Card
            padding="lg"
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              marginTop: '1.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Active Session
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Signed in as <strong>{user.fullName}</strong> (@{user.username})
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                toastSuccess?.('Logged out successfully');
                navigate('/login');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--status-error)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              className="hover:bg-red-500/15"
            >
              <LogOut size={16} />
              <span>Log Out from Account</span>
            </button>
          </Card>
        </>
      ) : (
        /* Unauthenticated View */
        <Card padding="lg" style={{ width: '100%', textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Lock size={30} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Account Profile &amp; Settings
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
            Sign in or register to manage your personal credentials, view your system-generated @username, and customize your meeting preferences.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/login">
              <Button variant="primary" size="md" icon={<LogIn size={16} />}>
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="secondary" size="md" icon={<UserPlus size={16} />}>
                Create Account
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <style>{`
        .settings-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15) !important;
          background-color: var(--bg-surface) !important;
        }
        @media (max-width: 768px) {
          .settings-hero-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};
export default Settings;
