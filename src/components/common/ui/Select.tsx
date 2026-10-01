import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  helperText,
  error,
  fullWidth = true,
  className = '',
  id,
  disabled,
  required,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}` : `select-${generatedId}`);
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;

  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-bold text-[#1A1A1A] dark:text-zinc-200 flex items-center justify-between"
        >
          <span>{label}</span>
          {required && <span className="text-red-500 text-[10px]" aria-label="حقل إلزامي">*</span>}
        </label>
      )}

      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-required={required ? 'true' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-errormessage={error ? errorId : undefined}
          className={`
            w-full appearance-none bg-[#FAF7F2] dark:bg-zinc-800 
            text-[#1A1A1A] dark:text-zinc-100 
            border rounded-2xl text-xs sm:text-sm pl-4 pr-10 py-2.5 transition-all cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-[#800020] dark:focus:ring-[#D4AF37] focus:bg-white dark:focus:bg-zinc-900
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-zinc-700 hover:border-[#800020]/30'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 pointer-events-none" aria-hidden="true" />
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

Select.displayName = 'Select';
