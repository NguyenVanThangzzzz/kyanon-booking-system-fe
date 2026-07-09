import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';
import { Spinner } from '@/common/components/ui/Spinner';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { roomService } from '@/features/room/services/room.service';
import type { Room } from '@/features/room/types/room.types';
import { bookingService } from '../services/booking.service';
import type { ApiError } from '@/types/api.types';

const schema = z.object({
  adults: z
    .number({ invalid_type_error: 'Vui lòng nhập số người lớn' })
    .int()
    .min(1, 'Cần ít nhất 1 người lớn')
    .max(20, 'Tối đa 20 người lớn'),
  children: z
    .number({ invalid_type_error: 'Vui lòng nhập số trẻ em' })
    .int()
    .min(0, 'Số trẻ em không hợp lệ')
    .max(10, 'Tối đa 10 trẻ em'),
  specialRequests: z.string().max(500, 'Tối đa 500 ký tự').optional(),
});

type FormValues = z.infer<typeof schema>;

const diffDays = (a: string, b: string) => {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

const BookingNewPage = (): JSX.Element => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const roomId = searchParams.get('roomId') ?? '';
  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 1;
  const pricePerNight = room?.roomType?.basePricePerNight ?? 0;
  const subtotal = pricePerNight * nights;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { adults: 1, children: 0, specialRequests: '' },
  });

  useEffect(() => {
    if (!roomId) {
      setRoomLoading(false);
      return;
    }
    roomService
      .getRoomById(roomId)
      .then(setRoom)
      .catch(() => showToast('Không thể tải thông tin phòng', 'error'))
      .finally(() => setRoomLoading(false));
  }, [roomId, showToast]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!roomId || !checkIn || !checkOut) {
      showToast('Thiếu thông tin đặt phòng. Vui lòng chọn phòng và ngày lại.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await bookingService.createBooking({
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: values.adults,
        children: values.children,
        specialRequests: values.specialRequests || undefined,
      });
      showToast(`Đặt phòng thành công! Mã: ${result.booking_ref}`, 'success', 5000);
      navigate(`/bookings/${result.booking.id}/payment`);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.statusCode === 409) {
        showToast('Phòng đã có người đặt trong khoảng thời gian này. Vui lòng chọn ngày khác.', 'error');
      } else if (apiError.statusCode === 503) {
        showToast('Phòng đang được đặt đồng thời. Vui lòng thử lại sau.', 'warning');
      } else {
        showToast(apiError.message ?? 'Đặt phòng thất bại. Vui lòng thử lại.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!roomId || !checkIn || !checkOut) {
    return (
      <div className="container-app py-16 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Thiếu thông tin đặt phòng</h2>
        <p className="text-neutral-500 mb-6">Vui lòng chọn phòng và ngày từ trang danh sách phòng.</p>
        <Button variant="primary" onClick={() => navigate('/rooms')}>
          Xem danh sách phòng
        </Button>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-6"
      >
        ← Quay lại
      </button>

      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Xác nhận đặt phòng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={(e) => { void handleSubmit(onSubmit)(e); }} className="space-y-6">

            {/* Guests section */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
              <h2 className="text-base font-semibold text-neutral-900">Thông tin khách</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Số người lớn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    {...register('adults', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  {errors.adults && (
                    <p className="mt-1 text-xs text-red-500">{errors.adults.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Số trẻ em
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    {...register('children', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  {errors.children && (
                    <p className="mt-1 text-xs text-red-500">{errors.children.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Yêu cầu đặc biệt{' '}
                  <span className="text-neutral-400 font-normal">(tuỳ chọn)</span>
                </label>
                <textarea
                  {...register('specialRequests')}
                  rows={3}
                  maxLength={500}
                  placeholder="VD: Phòng tầng cao, giường đơn, đến muộn..."
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
                {errors.specialRequests && (
                  <p className="mt-1 text-xs text-red-500">{errors.specialRequests.message}</p>
                )}
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-5">
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Chính sách hủy phòng</h3>
              <ul className="text-xs text-neutral-600 space-y-1.5">
                <li className="flex justify-between"><span>Hủy trước 7 ngày</span><span className="text-green-600 font-medium">Hoàn 100%</span></li>
                <li className="flex justify-between"><span>Hủy 3–6 ngày trước nhận phòng</span><span className="text-amber-600 font-medium">Hoàn 70%</span></li>
                <li className="flex justify-between"><span>Hủy 1–2 ngày trước nhận phòng</span><span className="text-orange-600 font-medium">Hoàn 30%</span></li>
                <li className="flex justify-between"><span>Hủy cùng ngày nhận phòng</span><span className="text-red-600 font-medium">Không hoàn</span></li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full"
            >
              Xác nhận đặt phòng
            </Button>

            <p className="text-center text-xs text-neutral-400">
              Chưa thanh toán ngay — thanh toán tại quầy lễ tân khi nhận phòng
            </p>
          </form>
        </div>

        {/* Booking summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sticky top-20 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
              Tóm tắt đặt phòng
            </h2>

            {roomLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-neutral-200 rounded-xl" />
                <div className="h-4 bg-neutral-200 rounded-full w-2/3" />
                <div className="h-3 bg-neutral-200 rounded-full w-1/2" />
              </div>
            ) : room ? (
              <div className="space-y-3">
                {room.imageUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={room.imageUrl}
                      alt={room.name}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-neutral-900 text-base">{room.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {room.roomType && (
                      <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {room.roomType.name}
                      </span>
                    )}
                    {room.floor && (
                      <span className="text-xs text-neutral-400">Tầng {room.floor}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border-t border-neutral-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-neutral-700">
                <span>Nhận phòng</span>
                <span className="font-medium">{formatDate(checkIn)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Trả phòng</span>
                <span className="font-medium">{formatDate(checkOut)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Số đêm</span>
                <span className="font-medium">{nights} đêm</span>
              </div>
            </div>

            {pricePerNight > 0 && (
              <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>{formatCurrency(pricePerNight, 'VND', 'vi-VN')} × {nights} đêm</span>
                  <span>{formatCurrency(subtotal, 'VND', 'vi-VN')}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-100 text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatCurrency(subtotal, 'VND', 'vi-VN')}</span>
                </div>
              </div>
            )}

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-primary-600">
                <Spinner size="sm" />
                <span>Đang xử lý đặt phòng...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { BookingNewPage };
export default BookingNewPage;
