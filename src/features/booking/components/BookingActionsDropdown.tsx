import { useState, useRef, useEffect } from 'react';
import { cn } from '@/common/utils/cn';

export type BookingActionKey = 'confirm' | 'check-in' | 'check-out' | 'no-show' | 'cancel';

export interface BookingAction {
  key: BookingActionKey;
  label: string;
  variant: 'primary' | 'success' | 'neutral' | 'warning' | 'danger';
}

interface BookingActionsDropdownProps {
  actions: BookingAction[];
  onAction: (key: BookingActionKey) => void;
  disabled?: boolean;
}

const VARIANT_CLASSES: Record<BookingAction['variant'], string> = {
  primary: 'text-primary-700 hover:bg-primary-50',
  success: 'text-green-700 hover:bg-green-50',
  neutral: 'text-neutral-700 hover:bg-neutral-100',
  warning: 'text-orange-700 hover:bg-orange-50',
  danger: 'text-red-700 hover:bg-red-50',
};

export const BookingActionsDropdown = ({
  actions,
  onAction,
  disabled = false,
}: BookingActionsDropdownProps): JSX.Element => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (actions.length === 0) {
    return <span className="text-xs text-neutral-300 italic">—</span>;
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
          'border-neutral-200 bg-white text-neutral-700 hover:border-primary-400 hover:text-primary-700',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        )}
      >
        Thao tác
        <svg
          className={cn('h-3 w-3 transition-transform', open && 'rotate-180')}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 z-20 mt-1 w-44 origin-top-right',
            'bg-white rounded-xl shadow-lg border border-neutral-200',
            'animate-fade-in',
          )}
        >
          <div className="py-1">
            {actions.map((action, idx) => (
              <button
                key={action.key}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAction(action.key);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm font-medium transition-colors',
                  VARIANT_CLASSES[action.variant],
                  // divider before danger actions
                  action.variant === 'danger' &&
                    idx > 0 &&
                    'border-t border-neutral-100 mt-1 pt-2',
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
