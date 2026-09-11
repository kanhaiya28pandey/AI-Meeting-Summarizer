import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  hoverEffect = false,
  className = '',
  style,
  ...rest
}) => {
  const paddingMap = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
    padding: paddingMap[padding],
    transition: hoverEffect ? 'transform 0.15s ease, box-shadow 0.15s ease' : undefined,
    ...style,
  };

  return (
    <div
      style={cardStyles}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
};
