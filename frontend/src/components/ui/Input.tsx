import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <input ref={ref} className={`input-field ${error ? 'border-error ring-2 ring-error/10' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <select ref={ref} className={`input-field cursor-pointer ${error ? 'border-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <textarea ref={ref} className={`input-field resize-none ${error ? 'border-error' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
