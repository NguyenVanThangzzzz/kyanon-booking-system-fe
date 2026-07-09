import { Link } from 'react-router-dom';
import { cn } from '@/common/utils/cn';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
  className?: string;
  center?: boolean;
}

export const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = 'View all',
  className,
  center = false,
}: SectionHeaderProps) => (
  <div className={cn('flex items-end justify-between gap-4 mb-8 lg:mb-10', className)}>
    <div className={cn(center && 'text-center w-full')}>
      {eyebrow && (
        <p className="text-sm font-semibold text-primary-600 mb-2 uppercase tracking-wide">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{title}</h2>
      {subtitle && (
        <p className="text-neutral-500 mt-2 max-w-xl">{subtitle}</p>
      )}
    </div>
    {viewAllTo && !center && (
      <Link
        to={viewAllTo}
        className="shrink-0 text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
      >
        {viewAllLabel}
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);
