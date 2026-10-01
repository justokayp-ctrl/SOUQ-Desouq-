import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'bordered' | 'goldGlow' | 'shieldFramed';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'bg-white dark:bg-zinc-900 rounded-2xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default: 'border border-stone-200/80 dark:border-zinc-800 shadow-xs',
    interactive: 'border border-stone-200 dark:border-zinc-800 hover:border-[#800020]/40 dark:hover:border-[#D4AF37]/50 shadow-xs hover:shadow-md hover:shadow-[#800020]/5 cursor-pointer hover:-translate-y-0.5',
    bordered: 'border-2 border-[#800020]/15 dark:border-zinc-700',
    goldGlow: 'border border-[#D4AF37]/50 dark:border-[#D4AF37]/40 shadow-md shadow-[#D4AF37]/15',
    shieldFramed: 'border border-[#800020]/20 dark:border-[#D4AF37]/30 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#800020] before:via-[#D4AF37] before:to-[#800020]',
  };

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 sm:p-6 pb-3 border-b border-stone-100 dark:border-zinc-800/80 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`font-serif font-bold text-base sm:text-lg text-[#1A1A1A] dark:text-zinc-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-stone-500 dark:text-zinc-400 mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 sm:p-6 pt-3 border-t border-stone-100 dark:border-zinc-800/80 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
