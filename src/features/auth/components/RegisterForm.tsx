import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '@/common/components/ui/Input';
import { Button } from '@/common/components/ui/Button';
import { useRegister } from '../hooks/useRegister';
import type { AuthUser } from '@/contexts/auth/AuthContext';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Tên là bắt buộc').max(50),
    lastName: z.string().min(1, 'Họ là bắt buộc').max(50),
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(100),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: (user: AuthUser) => void;
  onSwitchToLogin?: () => void;
}

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

const getStrengthLevel = (pw: string): number => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthColors = ['bg-error-500', 'bg-warning-500', 'bg-warning-400', 'bg-primary-400', 'bg-primary-500'];
const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps = {}) => {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const { register: registerUser, isLoading, error } = useRegister({ onSuccess });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ({ confirmPassword: _cp, ...data }: RegisterFormValues) => {
    await registerUser(data);
  };

  const strengthLevel = passwordValue ? getStrengthLevel(passwordValue) : 0;

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4" noValidate>
      {error && (
        <div className="rounded-xl bg-error-50 border border-error-200 px-4 py-3 text-sm text-error-700 animate-slide-up" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('register.first_name')}
          autoComplete="given-name"
          required
          placeholder="Nguyễn"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label={t('register.last_name')}
          autoComplete="family-name"
          required
          placeholder="Văn A"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label={t('register.email')}
        type="email"
        autoComplete="email"
        required
        placeholder="email@example.com"
        error={errors.email?.message}
        leftElement={<MailIcon />}
        {...register('email')}
      />

      <div>
        <Input
          label={t('register.password')}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="••••••••"
          error={errors.password?.message}
          leftElement={<LockIcon />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors pointer-events-auto"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              <EyeIcon open={showPassword} />
            </button>
          }
          {...register('password', {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPasswordValue(e.target.value),
          })}
        />
        {passwordValue && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
            {strengthLevel > 0 && (
              <p className="text-xs text-neutral-500">
                Độ mạnh: <span className="font-medium">{strengthLabels[strengthLevel]}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <Input
        label={t('register.confirm_password')}
        type={showConfirm ? 'text' : 'password'}
        autoComplete="new-password"
        required
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        leftElement={<LockIcon />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors pointer-events-auto"
            tabIndex={-1}
            aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
          >
            <EyeIcon open={showConfirm} />
          </button>
        }
        {...register('confirmPassword')}
      />

      <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="rounded-xl">
        {isLoading ? t('register.loading') : t('register.submit')}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        {t('register.have_account')}{' '}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
          >
            {t('register.login_link')}
          </button>
        ) : (
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            {t('register.login_link')}
          </Link>
        )}
      </p>
    </form>
  );
};
