import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';
import { Modal } from '@/common/components/ui/Modal/Modal';
import { cn } from '@/common/utils/cn';
import {
  AUTO_APPROVE_TIME_LIMIT,
  STANDARD_CHECKOUT_TIME,
} from '../types/late-checkout.types';

const TIME_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const requestSchema = z.object({
  requestedUntil: z
    .string()
    .regex(TIME_REGEX, 'Định dạng giờ không hợp lệ (HH:MM)')
    .refine(
      (time) => {
        const [hour, min] = time.split(':').map(Number);
        return hour * 60 + min > 12 * 60;
      },
      { message: 'Giờ trả phòng phải sau 12:00' },
    ),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestLateCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestedUntil: string) => Promise<void>;
}

const QUICK_PRESETS = ['13:00', '14:00', '15:00', '16:00'] as const;

const isAutoApproveCandidate = (time: string): boolean => {
  if (!TIME_REGEX.test(time)) return false;
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + min <= 14 * 60;
};

export const RequestLateCheckoutModal = ({
  isOpen,
  onClose,
  onSubmit,
}: RequestLateCheckoutModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { requestedUntil: '14:00' },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const currentValue = watch('requestedUntil');
  const autoApprove = isAutoApproveCandidate(currentValue);

  useEffect(() => {
    if (isOpen) {
      reset({ requestedUntil: '14:00' });
      setServerError(null);
    }
  }, [isOpen, reset]);

  const submitHandler = async (values: RequestFormValues): Promise<void> => {
    setServerError(null);
    try {
      await onSubmit(values.requestedUntil);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setServerError(apiError.message ?? 'Không thể gửi yêu cầu, vui lòng thử lại');
    }
  };

  const handlePreset = (preset: string): void => {
    setValue('requestedUntil', preset, { shouldValidate: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yêu cầu trả phòng muộn" size="lg">
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div className="bg-info-50 border border-info-100 rounded-xl p-3 text-sm text-info-700">
          <p className="font-medium mb-1">Cách tính phí trả phòng muộn</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            <li>
              Giờ trả phòng chuẩn là <strong>{STANDARD_CHECKOUT_TIME}</strong>.
            </li>
            <li>
              Yêu cầu đến trước <strong>{AUTO_APPROVE_TIME_LIMIT}</strong> và không có khách kế tiếp:
              tự động duyệt, miễn phí.
            </li>
            <li>Ngược lại: cần staff duyệt, có phụ phí tính theo giờ vượt.</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">Chọn nhanh</label>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset) => {
              const isActive = currentValue === preset;
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handlePreset(preset)}
                  className={cn(
                    'text-sm font-medium px-4 py-1.5 rounded-full transition-colors border',
                    isActive
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-400 hover:text-primary-600',
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="requestedUntil"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Giờ trả phòng mong muốn <span className="text-error-500">*</span>
          </label>
          <input
            id="requestedUntil"
            type="time"
            step={60}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('requestedUntil')}
          />
          {errors.requestedUntil && (
            <p className="text-xs text-error-600 mt-1">{errors.requestedUntil.message}</p>
          )}
          {!errors.requestedUntil && currentValue && TIME_REGEX.test(currentValue) && (
            <p
              className={cn(
                'text-xs mt-1 font-medium',
                autoApprove ? 'text-success-600' : 'text-warning-600',
              )}
            >
              {autoApprove
                ? '✓ Có thể được tự động duyệt nếu không có khách kế tiếp'
                : '⚠ Vượt 2 giờ — cần staff duyệt, có phụ phí'}
            </p>
          )}
        </div>

        {serverError && (
          <div className="bg-error-50 border border-error-100 rounded-lg px-3 py-2 text-sm text-error-700">
            {serverError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Gửi yêu cầu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
