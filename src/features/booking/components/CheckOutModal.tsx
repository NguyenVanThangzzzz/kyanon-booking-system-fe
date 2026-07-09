import { useForm } from 'react-hook-form';
import { Modal } from '@/common/components/ui/Modal';
import { Button } from '@/common/components/ui/Button';
import { formatDate } from '@/common/utils/format';

interface FormValues {
  actualCheckOutAt: string;
}

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actualCheckOutAt?: string) => Promise<void>;
  isLoading?: boolean;
  bookingRef: string;
  checkOutDate: string;
}

export const CheckOutModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bookingRef,
  checkOutDate,
}: CheckOutModalProps): JSX.Element => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { actualCheckOutAt: '' },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const onFormSubmit = async (values: FormValues): Promise<void> => {
    await onSubmit(values.actualCheckOutAt || undefined);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Trả phòng — ${bookingRef}`} size="sm">
      <form onSubmit={(e) => { void handleSubmit(onFormSubmit)(e); }} className="space-y-5">

        <div className="rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-700">
          <p>
            Ngày trả phòng dự kiến:{' '}
            <span className="font-semibold">
              {checkOutDate ? formatDate(checkOutDate) : '—'}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Thời gian trả phòng thực tế{' '}
            <span className="text-neutral-400 font-normal">(để trống = hiện tại)</span>
          </label>
          <input
            {...register('actualCheckOutAt')}
            type="datetime-local"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
            Xác nhận trả phòng
          </Button>
        </div>
      </form>
    </Modal>
  );
};
