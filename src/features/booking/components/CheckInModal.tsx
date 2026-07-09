import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/common/components/ui/Modal';
import { Button } from '@/common/components/ui/Button';
import type { CheckInRequest, IdType } from '../types/booking.types';

const schema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(255),
  idNumber: z.string().min(5, 'Số giấy tờ tối thiểu 5 ký tự').max(100),
  idType: z.enum(['cccd', 'passport', 'driver_license']),
  nationality: z.string().max(100).optional(),
  dateOfBirth: z.string().optional(),
  actualCheckInAt: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ID_TYPE_OPTIONS: Array<{ value: IdType; label: string }> = [
  { value: 'cccd', label: 'CCCD / Căn cước công dân' },
  { value: 'passport', label: 'Hộ chiếu' },
  { value: 'driver_license', label: 'Bằng lái xe' },
];

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckInRequest) => Promise<void>;
  isLoading?: boolean;
  bookingRef: string;
}

export const CheckInModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  bookingRef,
}: CheckInModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { idType: 'cccd' },
  });

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const onFormSubmit = async (values: FormValues): Promise<void> => {
    const payload: CheckInRequest = {
      primaryGuest: {
        fullName: values.fullName,
        idNumber: values.idNumber,
        idType: values.idType,
        nationality: values.nationality || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
      },
      actualCheckInAt: values.actualCheckInAt || undefined,
    };
    await onSubmit(payload);
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Nhận phòng — ${bookingRef}`} size="md">
      <form onSubmit={(e) => { void handleSubmit(onFormSubmit)(e); }} className="space-y-5">

        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Nhập thông tin giấy tờ tùy thân của khách chính để hoàn tất check-in.
        </div>

        {/* Full name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            {...register('fullName')}
            type="text"
            placeholder="Nguyễn Văn A"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* ID type + number on same row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Loại giấy tờ <span className="text-red-500">*</span>
            </label>
            <select
              {...register('idType')}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            >
              {ID_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Số giấy tờ <span className="text-red-500">*</span>
            </label>
            <input
              {...register('idNumber')}
              type="text"
              placeholder="012345678901"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
            {errors.idNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.idNumber.message}</p>
            )}
          </div>
        </div>

        {/* Nationality + DOB */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Quốc tịch <span className="text-neutral-400 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              {...register('nationality')}
              type="text"
              placeholder="Vietnamese"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ngày sinh <span className="text-neutral-400 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              {...register('dateOfBirth')}
              type="date"
              className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {/* Actual check-in time */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Thời gian nhận phòng thực tế{' '}
            <span className="text-neutral-400 font-normal">(để trống = hiện tại)</span>
          </label>
          <input
            {...register('actualCheckInAt')}
            type="datetime-local"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

        {/* Actions */}
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
            Xác nhận nhận phòng
          </Button>
        </div>
      </form>
    </Modal>
  );
};
