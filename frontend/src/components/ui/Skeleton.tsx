import type { FC, CSSProperties } from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      aria-hidden="true"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
        backgroundColor: 'var(--border-subtle)',
        backgroundImage:
          'linear-gradient(90deg, var(--border-subtle) 0%, var(--border) 50%, var(--border-subtle) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite ease-in-out',
        ...style,
      }}
    />
  );
};
