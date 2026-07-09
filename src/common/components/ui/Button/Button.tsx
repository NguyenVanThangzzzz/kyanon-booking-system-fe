import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/common/utils/cn';
import { Spinner } from '../Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-300',
  secondary:
    'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-300',
  outline:
    'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300',
  ghost:
    'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500 disabled:text-secondary-400',
  danger:
    'bg-error-500 text-white hover:bg-error-700 focus:ring-error-500 disabled:bg-error-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled ?? isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
