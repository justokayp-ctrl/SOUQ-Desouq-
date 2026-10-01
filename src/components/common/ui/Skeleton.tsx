import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'circle' | 'button';
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseStyles = 'bg-gray-200 dark:bg-zinc-800 animate-pulse rounded-xl';

  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    card: 'h-48 w-full rounded-2xl',
    circle: 'w-10 h-10 rounded-full shrink-0',
    button: 'h-10 w-28 rounded-full',
  };

  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};
