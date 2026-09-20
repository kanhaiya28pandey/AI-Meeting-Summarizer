import React from 'react';

export interface LogoIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Modern vector icon featuring neural audio soundwaves intersecting into an intelligence node.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ size = 36, className = '', style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        flexShrink: 0,
        filter: 'drop-shadow(0 4px 10px rgba(99, 102, 241, 0.35))',
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Background Base Gradient */}
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Pulse Accent Gradient */}
        <linearGradient id="logoWaveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>

        {/* Neural Glow */}
        <radialGradient id="neuralGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Rounded Squircle Container */}
      <rect width="44" height="44" rx="12" fill="url(#logoBgGrad)" />

      {/* Subtle Inner Bevel Highlight */}
      <rect
        x="1"
        y="1"
        width="42"
        height="42"
        rx="11"
        fill="none"
        stroke="rgba(255, 255, 255, 0.28)"
        strokeWidth="1.2"
      />

      {/* Acoustic Frequency Waveforms forming the 'M' Soundwave Silhouette */}
      {/* Wave Bar 1 (Left low) */}
      <rect x="9.5" y="18" width="3.2" height="8" rx="1.6" fill="url(#logoWaveGrad)" />

      {/* Wave Bar 2 (Mid-left high) */}
      <rect x="15" y="12" width="3.2" height="20" rx="1.6" fill="url(#logoWaveGrad)" />

      {/* Wave Bar 3 (Central Intelligence Peak) */}
      <rect x="20.5" y="9" width="3.2" height="26" rx="1.6" fill="#ffffff" />

      {/* Wave Bar 4 (Mid-right high) */}
      <rect x="26" y="14" width="3.2" height="16" rx="1.6" fill="url(#logoWaveGrad)" />

      {/* Wave Bar 5 (Right low) */}
      <rect x="31.5" y="19" width="3.2" height="6" rx="1.6" fill="url(#logoWaveGrad)" />

      {/* Connecting Neural Pulse Arc (Symbolizing meeting dialogue synthesis) */}
      <path
        d="M 11 22 C 16 16, 22 28, 33 22"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />

      {/* Central AI Intelligence Star / Sparkle Node */}
      <path
        d="M 22.1 4.5 Q 22.1 7.2 24.8 7.2 Q 22.1 7.2 22.1 9.9 Q 22.1 7.2 19.4 7.2 Q 22.1 7.2 22.1 4.5 Z"
        fill="#fef08a"
        filter="drop-shadow(0 0 3px #fef08a)"
      />
    </svg>
  );
};

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'sidebar' | 'header' | 'hero';
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'sidebar',
  showText = true,
  className = '',
  style,
}) => {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 42 : 36;

  const isSidebar = variant === 'sidebar';
  const isHero = variant === 'hero';

  const titleColor = isSidebar || isHero ? '#ffffff' : 'var(--text-primary)';
  const subColor = isSidebar ? '#93c5fd' : isHero ? '#a5b4fc' : 'var(--primary)';

  return (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.5rem' : '0.75rem',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      <LogoIcon size={iconSize} />

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span
            style={{
              fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.1rem' : '0.95rem',
              fontWeight: 700,
              color: titleColor,
              letterSpacing: '-0.01em',
            }}
          >
            AI Meeting
          </span>
          <span
            style={{
              fontSize: size === 'sm' ? '0.7rem' : size === 'lg' ? '0.825rem' : '0.775rem',
              fontWeight: 500,
              color: subColor,
              letterSpacing: '0.01em',
            }}
          >
            Summarizer
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
