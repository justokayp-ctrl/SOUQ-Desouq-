import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'shield';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold font-serif transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer select-none';

  const sizeStyles = {
    xs: 'text-[11px] px-2.5 py-1 gap-1 min-h-[28px] rounded-lg',
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px] rounded-full',
    md: 'text-xs sm:text-sm px-5 py-2.5 gap-2 min-h-[42px] rounded-full',
    lg: 'text-sm sm:text-base px-7 py-3.5 gap-2.5 min-h-[48px] rounded-full',
  };

  const variantStyles = {
    primary: 'bg-[#800020] hover:bg-[#66001A] active:bg-[#520015] text-white border border-[#520015] shadow-xs hover:shadow-md hover:shadow-[#800020]/20 focus:ring-[#800020] dark:focus:ring-[#D4AF37]',
    gold: 'bg-[#D4AF37] hover:bg-[#B89628] active:bg-[#997B20] text-stone-950 font-bold border border-[#B89628] shadow-xs hover:shadow-md hover:shadow-[#D4AF37]/30 focus:ring-[#D4AF37]',
    secondary: 'bg-[#FAF7F2] dark:bg-zinc-800 text-[#1A1A1A] dark:text-zinc-100 border border-stone-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 hover:border-[#800020]/30 dark:hover:border-[#D4AF37]/40 shadow-xs focus:ring-[#800020]',
    outline: 'bg-transparent border-2 border-[#800020] text-[#800020] dark:border-[#D4AF37] dark:text-[#D4AF37] hover:bg-[#800020] hover:text-white dark:hover:bg-[#D4AF37] dark:hover:text-black focus:ring-[#800020]',
    ghost: 'bg-transparent text-stone-700 dark:text-zinc-300 hover:bg-[#800020]/10 dark:hover:bg-zinc-800 hover:text-[#800020] dark:hover:text-[#D4AF37] focus:ring-[#D4AF37]',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border border-red-700 shadow-xs focus:ring-red-600',
    shield: 'bg-[#800020] hover:bg-[#66001A] text-white border border-[#D4AF37]/50 desoq-chamfer-corner shadow-xs hover:shadow-md focus:ring-[#D4AF37]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type="button"
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
