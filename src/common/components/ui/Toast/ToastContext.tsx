import { createContext, useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastContainer } from './Toast';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'primary';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success', duration = 3500) => {
      const id = String(++counter.current);
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};
