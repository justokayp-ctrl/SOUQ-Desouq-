import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  id,
  disabled,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}` : `input-${generatedId}`);
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-[#1A1A1A] dark:text-zinc-200 flex items-center justify-between"
        >
          <span>{label}</span>
          {required && <span className="text-red-500 text-[10px]" aria-label="حقل إلزامي">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-errormessage={error ? errorId : undefined}
          className={`
            w-full bg-[#FAF7F2] dark:bg-zinc-800 
            text-[#1A1A1A] dark:text-zinc-100 
            placeholder-gray-400 dark:placeholder-zinc-500
            border rounded-2xl text-xs sm:text-sm px-4 py-2.5 transition-all
            focus:outline-none focus:ring-2 focus:ring-[#800020] dark:focus:ring-[#D4AF37] focus:bg-white dark:focus:bg-zinc-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-zinc-700 hover:border-[#800020]/30'}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 pointer-events-none" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" aria-live="assertive" className="text-[11px] font-bold text-red-500 flex items-center gap-1">
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-[11px] text-gray-500 dark:text-zinc-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
