import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ToastProvider } from '@/common/components/ui/Toast/ToastContext';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
};
