import { cn } from '@/common/utils/cn';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-neutral-100 text-neutral-700',
  primary:  'bg-primary-100 text-primary-700',
  success:  'bg-success-50 text-success-600',
  warning:  'bg-warning-50 text-warning-600',
  error:    'bg-error-50 text-error-600',
  outline:  'border border-neutral-300 text-neutral-600 bg-transparent',
};

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
      className,
    )}
  >
    {children}
  </span>
);
