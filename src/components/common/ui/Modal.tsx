import React, { useId } from 'react';
import { X } from 'lucide-react';
import { FocusTrap } from '../FocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  ariaLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  ariaLabel,
}) => {
  const uniqueId = useId();
  const titleId = `modal-title-${uniqueId}`;
  const descId = `modal-desc-${uniqueId}`;

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <FocusTrap
      isActive={isOpen}
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      aria-label={!title ? (ariaLabel || 'نافذة منبثقة') : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white dark:bg-zinc-900 rounded-3xl border border-[#800020]/20 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-4 z-10 my-8 animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        {(title || description) && (
          <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              {title && (
                <h2 id={titleId} className="text-lg font-serif font-bold text-[#800020] dark:text-[#D4AF37]">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="text-xs text-gray-500 dark:text-zinc-400 mt-1">{description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#800020] dark:focus-visible:ring-[#D4AF37] focus:outline-none"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}

        {!title && !description && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 min-w-[44px] min-h-[44px] rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#800020] dark:focus-visible:ring-[#D4AF37] focus:outline-none"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        <div>{children}</div>
      </div>
    </FocusTrap>
  );
};
