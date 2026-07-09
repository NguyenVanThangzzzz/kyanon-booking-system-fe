import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import { LoadingScreen } from '@/common/components/ui/LoadingScreen';

const MIN_DISPLAY_MS = 1000;
const FADE_OUT_MS = 250;

export const AppLoadingGate = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);

      const fadeTimer = setTimeout(() => setFadeOut(true), remaining);
      const hideTimer = setTimeout(() => setVisible(false), remaining + FADE_OUT_MS);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isLoading]);

  return (
    <>
      {visible && <LoadingScreen fadeOut={fadeOut} />}
      {children}
    </>
  );
};
