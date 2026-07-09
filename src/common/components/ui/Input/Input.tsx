import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/common/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-secondary-400">{leftElement}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border px-3 py-2 text-sm text-secondary-900',
              'placeholder:text-secondary-400',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
              'transition-colors',
              error
                ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
                : 'border-secondary-300',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-secondary-400">{rightElement}</span>
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="form-error" role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={`${inputId}-hint`} className="mt-1 text-sm text-secondary-500">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
