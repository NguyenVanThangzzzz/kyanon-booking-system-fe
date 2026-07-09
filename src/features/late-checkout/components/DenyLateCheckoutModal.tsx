import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';
import { Modal } from '@/common/components/ui/Modal/Modal';
import type { LateCheckout } from '../types/late-checkout.types';

const denySchema = z.object({
  notes: z
    .string()
    .min(1, 'Vui lòng nhập lý do từ chối')
    .max(500, 'Ghi chú tối đa 500 ký tự'),
});

type DenyFormValues = z.infer<typeof denySchema>;

interface DenyLateCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lateCheckout: LateCheckout;
  onSubmit: (payload: { notes: string }) => Promise<void>;
}

export const DenyLateCheckoutModal = ({
  isOpen,
  onClose,
  lateCheckout,
  onSubmit,
}: DenyLateCheckoutModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DenyFormValues>({
    resolver: zodResolver(denySchema),
    defaultValues: { notes: '' },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      reset({ notes: '' });
      setServerError(null);
    }
  }, [isOpen, reset]);

  const submitHandler = async (values: DenyFormValues): Promise<void> => {
    setServerError(null);
    try {
      await onSubmit({ notes: values.notes });
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setServerError(apiError.message ?? 'Không thể từ chối yêu cầu, vui lòng thử lại');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Từ chối yêu cầu trả phòng muộn" size="lg">
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-neutral-500">Booking ID:</span>
            <span className="font-mono text-neutral-700">{lateCheckout.bookingId.slice(0, 8)}…</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Giờ yêu cầu:</span>
            <span className="font-semibold text-neutral-900">{lateCheckout.requestedUntil}</span>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
            Lý do từ chối <span className="text-error-500">*</span>
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder="VD: Có khách kế tiếp đặt phòng ngay sau, không thể chậm trễ thời gian dọn phòng."
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
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            Từ chối
          </Button>
        </div>
      </form>
    </Modal>
  );
};
