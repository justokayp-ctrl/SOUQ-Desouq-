import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`max-w-md mx-auto my-8 p-8 text-center space-y-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-800 ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-[#F5F2ED] dark:bg-zinc-800 text-[#800020] dark:text-[#D4AF37] flex items-center justify-center mx-auto text-2xl shadow-xs">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>

      <div className="space-y-1">
        <h3 className="font-serif font-bold text-base sm:text-lg text-[#1A1A1A] dark:text-zinc-100">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
