import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  const typeStyles = {
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    error: 'bg-red-900 text-red-100 border-red-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
    info: 'bg-[#800020] text-white border-[#D4AF37]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-300 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#D4AF37] shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl text-xs font-bold max-w-md w-full animate-in slide-in-from-bottom-5 duration-200 ${typeStyles[type]}`}
      role="alert"
    >
      {icons[type]}
      <span className="flex-1 text-right leading-snug">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
