import React from 'react';

export interface ShieldBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'burgundy' | 'gold' | 'emerald' | 'charcoal';
  size?: 'xs' | 'sm' | 'md';
  icon?: React.ReactNode;
}

export const ShieldBadge: React.FC<ShieldBadgeProps> = ({
  children,
  variant = 'burgundy',
  size = 'sm',
  icon,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[11px] px-2.5 py-1',
    md: 'text-xs px-3 py-1.5',
  };

  const variantStyles = {
    burgundy: 'bg-[#800020] text-white border border-[#5C061E] shadow-xs',
    gold: 'bg-[#D4AF37] text-stone-900 border border-[#B89628] font-bold shadow-xs',
    emerald: 'bg-emerald-700 text-white border border-emerald-800 shadow-xs',
    charcoal: 'bg-stone-900 text-stone-100 border border-stone-800 shadow-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold whitespace-nowrap desoq-chamfer-corner transition-transform hover:scale-102 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
