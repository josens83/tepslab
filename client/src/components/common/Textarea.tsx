import { type TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      rows = 4,
      ...props
    },
    ref
  ) => {
    const widthStyles = fullWidth ? 'w-full' : '';
    const baseStyles = 'px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-none';
    const errorStyles = error
      ? 'border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-brand-yellow focus:border-brand-yellow';

    return (
      <div className={widthStyles}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${errorStyles} ${widthStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
