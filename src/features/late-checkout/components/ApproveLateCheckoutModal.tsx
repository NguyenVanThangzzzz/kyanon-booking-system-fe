import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';
import { Modal } from '@/common/components/ui/Modal/Modal';
import { formatCurrency } from '@/common/utils/format';
import type { LateCheckout } from '../types/late-checkout.types';

const approveSchema = z.object({
  extraCharge: z
    .number({ invalid_type_error: 'Vui lòng nhập số hợp lệ' })
    .nonnegative('Phụ phí phải lớn hơn hoặc bằng 0'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().or(z.literal('')),
});

type ApproveFormValues = z.infer<typeof approveSchema>;

interface ApproveLateCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lateCheckout: LateCheckout;
  onSubmit: (payload: { extra_charge: number; notes?: string }) => Promise<void>;
}

export const ApproveLateCheckoutModal = ({
  isOpen,
  onClose,
  lateCheckout,
  onSubmit,
}: ApproveLateCheckoutModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { extraCharge: lateCheckout.extraCharge, notes: '' },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset({ extraCharge: lateCheckout.extraCharge, notes: '' });
      setServerError(null);
    }
  }, [isOpen, lateCheckout.extraCharge, reset]);

  const submitHandler = async (values: ApproveFormValues): Promise<void> => {
    setServerError(null);
    try {
      const payload: { extra_charge: number; notes?: string } = {
        extra_charge: values.extraCharge,
      };
      if (values.notes) payload.notes = values.notes;
      await onSubmit(payload);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setServerError(apiError.message ?? 'Không thể duyệt yêu cầu, vui lòng thử lại');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duyệt yêu cầu trả phòng muộn" size="lg">
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">Booking ID:</span>
            <span className="font-mono text-neutral-700">{lateCheckout.bookingId.slice(0, 8)}…</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Giờ chuẩn:</span>
            <span className="text-neutral-700">{lateCheckout.standardCheckOutTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Giờ yêu cầu:</span>
            <span className="font-semibold text-neutral-900">{lateCheckout.requestedUntil}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Phí hệ thống tính:</span>
            <span className="font-semibold text-primary-700">
              {formatCurrency(lateCheckout.extraCharge, 'VND', 'vi-VN')}
            </span>
          </div>
        </div>

        {lateCheckout.conflictsWithBookingId && (
          <div className="bg-warning-50 border border-warning-100 rounded-lg px-3 py-2 text-sm text-warning-700">
            ⚠ Có đặt phòng kế tiếp ngay sau. Cân nhắc kỹ trước khi duyệt.
          </div>
        )}

        <div>
          <label
            htmlFor="extraCharge"
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Phụ phí áp dụng (VND) <span className="text-error-500">*</span>
          </label>
          <input
            id="extraCharge"
            type="number"
            min={0}
            step={1000}
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('extraCharge', { valueAsNumber: true })}
          />
          {errors.extraCharge && (
            <p className="text-xs text-error-600 mt-1">{errors.extraCharge.message}</p>
          )}
          <p className="text-xs text-neutral-500 mt-1">
            Bạn có thể giảm hoặc miễn phụ phí cho khách VIP. Đặt 0 để miễn phí.
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
            Ghi chú
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="VD: Khách thân thiết, miễn phụ phí"
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="text-xs text-error-600 mt-1">{errors.notes.message}</p>
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
            Duyệt yêu cầu
          </Button>
        </div>
      </form>
    </Modal>
  );
};
