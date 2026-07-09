import { cn } from '@/common/utils/cn';
import { STATUS_BADGE } from '../types/late-checkout.types';
import type { LateCheckoutStatus } from '../types/late-checkout.types';

interface LateCheckoutStatusBadgeProps {
  status: LateCheckoutStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export const LateCheckoutStatusBadge = ({
  status,
  size = 'md',
  className,
}: LateCheckoutStatusBadgeProps): JSX.Element => {
  const badge = STATUS_BADGE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        badge.className,
        sizeClasses[size],
        className,
      )}
    >
      {badge.label}
    </span>
  );
};
