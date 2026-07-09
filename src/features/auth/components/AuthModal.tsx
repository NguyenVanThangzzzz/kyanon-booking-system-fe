import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/common/utils/cn';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import type { AuthUser } from '@/contexts/auth/AuthContext';

type AuthView = 'login' | 'register';
type TransitionPhase = 'idle' | 'exiting' | 'entering';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
}

const viewConfig: Record<AuthView, { title: string; subtitle: string }> = {
  login:    { title: 'Đăng nhập',     subtitle: 'Chào mừng trở lại!' },
  register: { title: 'Tạo tài khoản', subtitle: 'Tham gia KyanonStay ngay hôm nay' },
};

export const AuthModal = ({ isOpen, onClose, initialView = 'login' }: AuthModalProps) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<AuthView>(initialView);
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('idle');
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [formKey, setFormKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const shouldRender = isOpen || isClosing;

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setIsClosing(false);
      setFormKey((k) => k + 1);
    }
  }, [isOpen, initialView]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => boxRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const switchView = (next: AuthView) => {
    const dir = next === 'register' ? 'left' : 'right';
    setDirection(dir);
    setTransitionPhase('exiting');
    setTimeout(() => {
      setView(next);
      setFormKey((k) => k + 1);
      setTransitionPhase('entering');
      setTimeout(() => setTransitionPhase('idle'), 280);
    }, 180);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    handleClose();
    setTimeout(() => {
      showToast(`Đăng nhập thành công! Chào mừng ${user.firstName} 👋`, 'primary', 4000);

      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        navigate('/dashboard', { replace: true });
        return;
      }

      const fromState = (location.state as { from?: { pathname: string } } | null)?.from;
      if (fromState?.pathname && fromState.pathname !== '/') {
        navigate(fromState.pathname, { replace: true });
      }
    }, 250);
  };

  const handleRegisterSuccess = (user: AuthUser) => {
    handleClose();
    setTimeout(() => {
      showToast(`Đăng ký thành công! Chào mừng ${user.firstName} đến với KyanonStay 🎉`, 'primary', 4000);

      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        navigate('/dashboard', { replace: true });
      }
    }, 250);
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className={cn(
        'fixed inset-0 z-[80] flex items-center justify-center p-4',
        isClosing ? 'animate-fade-out' : 'animate-fade-in',
      )}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Modal box */}
      <div
        ref={boxRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden focus:outline-none',
          'border border-primary-100',
          isClosing ? 'animate-modal-out' : 'animate-modal-in',
        )}
      >
        {/* Teal header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5 flex items-start justify-between">
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold text-white leading-tight">
              {viewConfig[view].title}
            </h2>
            <p className="text-primary-100 text-sm mt-0.5">{viewConfig[view].subtitle}</p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Đóng"
            className="text-white/70 hover:text-white hover:rotate-90 hover:bg-white/10 transition-all duration-200 p-1.5 rounded-lg ml-4 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <div
          className={cn(
            'px-6 py-6',
            transitionPhase === 'exiting'  && direction === 'left'  && 'animate-view-exit-left pointer-events-none',
            transitionPhase === 'exiting'  && direction === 'right' && 'animate-view-exit-right pointer-events-none',
            transitionPhase === 'entering' && direction === 'left'  && 'animate-view-enter-right',
            transitionPhase === 'entering' && direction === 'right' && 'animate-view-enter-left',
          )}
        >
          <div key={formKey} className="form-stagger-modal">
            {view === 'login' ? (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => switchView('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => switchView('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
