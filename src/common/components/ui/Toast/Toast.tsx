import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/common/utils/cn';
import type { ToastItem, ToastVariant } from './ToastContext';

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-success-600 text-white',
  error:   'bg-error-600 text-white',
  warning: 'bg-warning-600 text-white',
  info:    'bg-neutral-800 text-white',
  primary: 'bg-primary-500 text-white',
};

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const XCircleIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const InfoIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const variantIcons: Record<ToastVariant, JSX.Element> = {
  success: <CheckIcon />,
  primary: <CheckIcon />,
  error:   <XCircleIcon />,
  warning: <InfoIcon />,
  info:    <InfoIcon />,
};

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastItemComponent = ({ toast, onDismiss }: ToastItemProps) => {
  const [leaving, setLeaving] = useState(false);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLeaving(true);
      const exit = setTimeout(() => dismissRef.current(), 260);
      return () => clearTimeout(exit);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => dismissRef.current(), 260);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm w-full',
        variantStyles[toast.variant],
        leaving ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      {variantIcons[toast.variant]}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={handleClose}
        aria-label="Đóng thông báo"
        className="text-white/70 hover:text-white transition-colors ml-1 shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (toasts.length === 0) return null;
  return createPortal(
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItemComponent toast={toast} onDismiss={() => onDismiss(toast.id)} />
        </div>
      ))}
    </div>,
    document.body,
  );
};
