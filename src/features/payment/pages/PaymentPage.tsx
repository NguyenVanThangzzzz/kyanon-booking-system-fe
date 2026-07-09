import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/common/components/ui/Button';
import { Spinner } from '@/common/components/ui/Spinner';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency, formatDate } from '@/common/utils/format';
import { useAuth } from '@/contexts/auth/useAuth';
import { useBookingDetail } from '@/features/booking/hooks/useBookingDetail';
import { paymentService } from '../services/payment.service';
import { usePaymentCountdown, formatCountdown } from '../hooks/usePaymentCountdown';
import type { Payment, PaymentMethodType } from '../types/payment.types';
import type { ApiError } from '@/types/api.types';

const schema = z.object({
  buyerPhone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .max(15, 'Số điện thoại không hợp lệ')
    .regex(/^[0-9+\-\s]+$/, 'Số điện thoại không hợp lệ'),
  buyerAddress: z.string().min(5, 'Vui lòng nhập địa chỉ').max(200, 'Tối đa 200 ký tự'),
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'wallet'] as const),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ ngân hàng',
  transfer: 'Chuyển khoản',
  wallet: 'Ví điện tử',
};

const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, string> = {
  cash: '💵',
  card: '💳',
  transfer: '🏦',
  wallet: '📱',
};

type PagePhase = 'loading' | 'form' | 'qr' | 'success' | 'expired';

const CountdownBanner = ({
  secondsLeft,
  isCancelling,
}: {
  secondsLeft: number;
  isCancelling: boolean;
}) => {
  const isUrgent = secondsLeft <= 30;
  const isWarning = secondsLeft <= 60;
  const progress = (secondsLeft / 120) * 100;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 ${
        isUrgent
          ? 'bg-red-50 border-red-200'
          : isWarning
            ? 'bg-amber-50 border-amber-200'
            : 'bg-primary-50 border-primary-200'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`text-2xl ${isUrgent ? 'animate-wiggle' : ''}`}>⏱️</span>
          <div>
            <p
              className={`text-sm font-semibold ${
                isUrgent ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-primary-700'
              }`}
            >
              {isCancelling ? 'Đang hủy đặt phòng...' : 'Thời gian thanh toán còn lại'}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isUrgent ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-primary-500'
              }`}
            >
              {isUrgent
                ? 'Vui lòng thanh toán ngay, phòng sắp được trả lại!'
                : 'Hoàn tất thanh toán trước khi hết giờ để giữ phòng'}
            </p>
          </div>
        </div>

        {!isCancelling && (
          <div
            className={`text-3xl font-bold font-mono tabular-nums ${
              isUrgent ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-primary-600'
            }`}
          >
            {formatCountdown(secondsLeft)}
          </div>
        )}

        {isCancelling && <Spinner size="sm" />}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const PaymentPage = (): JSX.Element => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const { booking, isLoading: bookingLoading } = useBookingDetail(bookingId);

  const [phase, setPhase] = useState<PagePhase>('loading');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      buyerPhone: '',
      buyerAddress: '',
      paymentMethod: 'transfer',
    },
  });

  const selectedMethod = watch('paymentMethod');

  const handleCountdownExpired = useCallback(() => {
    showToast('Đã hết thời gian thanh toán. Đặt phòng đã bị hủy tự động.', 'error', 6000);
    setPhase('expired');
  }, [showToast]);

  // Countdown runs when booking is pending/confirmed and payment not yet done
  const shouldCountdown =
    phase !== 'success' &&
    phase !== 'expired' &&
    phase !== 'loading' &&
    booking?.status !== 'cancelled' &&
    booking?.paymentStatus !== 'paid';

  const { secondsLeft, isExpired, isCancelling } = usePaymentCountdown(
    shouldCountdown ? bookingId : undefined,
    shouldCountdown ? booking?.createdAt : undefined,
    handleCountdownExpired,
  );

  const initPage = useCallback(async (): Promise<void> => {
    if (!bookingId) return;

    // Booking already cancelled — skip to expired view
    if (booking?.status === 'cancelled') {
      setPhase('expired');
      return;
    }

    const existing = await paymentService.getPaymentByBookingId(bookingId);
    if (!existing) {
      setPhase('form');
      return;
    }
    setPayment(existing);
    if (existing.status === 'paid') {
      setPhase('success');
    } else {
      setPhase('qr');
    }
  }, [bookingId, booking?.status]);

  useEffect(() => {
    if (!bookingLoading) {
      void initPage();
    }
  }, [bookingLoading, initPage]);

  // Redirect to rooms after expired state (with delay so user can read the message)
  useEffect(() => {
    if (phase !== 'expired' || isCancelling) return;
    const timer = setTimeout(() => navigate('/rooms'), 4000);
    return () => clearTimeout(timer);
  }, [phase, isCancelling, navigate]);

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!bookingId || !booking || !user) return;
    setIsSubmitting(true);
    try {
      const created = await paymentService.createPaymentLink({
        bookingId,
        amount: booking.totalAmount,
        buyerName: `${user.firstName} ${user.lastName}`,
        buyerEmail: user.email,
        buyerPhone: values.buyerPhone,
        buyerAddress: values.buyerAddress,
        paymentMethod: values.paymentMethod,
      });
      setPayment(created);
      setPhase('qr');
    } catch (err) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Không thể tạo link thanh toán. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (): Promise<void> => {
    if (!payment?.orderCode) return;
    setIsVerifying(true);
    try {
      const verified = await paymentService.verifyPayment(payment.orderCode);
      if (verified?.status === 'paid') {
        setPayment(verified);
        setPhase('success');
        showToast('Thanh toán thành công!', 'success', 5000);
      } else {
        showToast(
          'Chưa nhận được thanh toán. Vui lòng kiểm tra lại hoặc thử sau ít phút.',
          'warning',
        );
      }
    } catch {
      showToast('Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  if (phase === 'loading' || bookingLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-neutral-500">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container-app py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-lg font-semibold text-neutral-900">Không tìm thấy thông tin đặt phòng</p>
        <Button variant="outline" className="mt-5" onClick={() => navigate('/bookings')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  // Phase: expired
  if (phase === 'expired') {
    return (
      <div className="container-app py-20 text-center max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-red-200 p-10 space-y-5 shadow-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-4xl">
            ⏰
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Hết thời gian thanh toán</h1>
          <p className="text-neutral-500 leading-relaxed">
            Đặt phòng <span className="font-mono font-semibold text-neutral-900">{booking.bookingRef}</span> đã bị
            hủy tự động do quá thời gian giữ phòng (2 phút).
          </p>
          <p className="text-sm text-neutral-400">Đang chuyển về trang danh sách phòng...</p>

          {isCancelling && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Spinner size="sm" />
              <span>Đang hủy đặt phòng...</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/rooms')}>
              Tìm phòng khác
            </Button>
            <Button variant="outline" size="md" className="w-full" onClick={() => navigate('/bookings')}>
              Lịch sử đặt phòng
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <button
        onClick={() => navigate(`/bookings/${bookingId}`)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-6"
      >
        ← Quay lại chi tiết đặt phòng
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Countdown banner — shown for form and qr phases */}
          {(phase === 'form' || phase === 'qr') && !isExpired && (
            <CountdownBanner secondsLeft={secondsLeft} isCancelling={isCancelling} />
          )}

          {/* Phase: success */}
          {phase === 'success' && (
            <div className="bg-white rounded-2xl border border-green-200 p-8 space-y-5">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">
                  ✅
                </div>
                <h1 className="text-2xl font-bold text-neutral-900">Thanh toán thành công!</h1>
                <p className="text-neutral-500">
                  Chúng tôi đã nhận được thanh toán của bạn. Mã đặt phòng:{' '}
                  <span className="font-mono font-semibold text-neutral-900">{booking.bookingRef}</span>
                </p>
              </div>

              {/* Room detail on success */}
              {booking.room && (
                <div className="flex gap-4 bg-neutral-50 rounded-xl p-4">
                  {booking.room.imageUrl && (
                    <div className="w-24 h-20 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={booking.room.imageUrl}
                        alt={booking.room.name}
                        width={96}
                        height={80}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900">{booking.room.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {booking.room.roomTypeName && (
                        <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {booking.room.roomTypeName}
                        </span>
                      )}
                      {booking.room.floor && (
                        <span className="text-xs text-neutral-400">Tầng {booking.room.floor}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)} · {booking.nights} đêm
                    </p>
                  </div>
                </div>
              )}

              {payment && (
                <div className="bg-green-50 rounded-xl p-4 text-sm space-y-1">
                  <div className="flex justify-between text-neutral-700">
                    <span>Số tiền đã thanh toán</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(payment.amountPaid, 'VND', 'vi-VN')}
                    </span>
                  </div>
                  {payment.transactionId && (
                    <div className="flex justify-between text-neutral-500">
                      <span>Mã giao dịch</span>
                      <span className="font-mono">{payment.transactionId}</span>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/bookings/${bookingId}`)}
              >
                Xem chi tiết đặt phòng
              </Button>
            </div>
          )}

          {/* Phase: QR code */}
          {phase === 'qr' && payment && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
              <div className="text-center">
                <h1 className="text-xl font-bold text-neutral-900 mb-1">Quét mã QR để thanh toán</h1>
                <p className="text-sm text-neutral-500">
                  Mở ứng dụng ngân hàng và quét mã QR bên dưới
                </p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                {payment.qrCode ? (
                  <div className="bg-white border-2 border-neutral-200 rounded-2xl p-4 shadow-sm">
                    <QRCodeSVG value={payment.qrCode} size={240} level="M" marginSize={2} />
                  </div>
                ) : (
                  <div className="w-60 h-60 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 text-sm">
                    QR không khả dụng
                  </div>
                )}

                {/* Amount */}
                <div className="text-center">
                  <p className="text-xs text-neutral-400 mb-1">Số tiền cần thanh toán</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(payment.amountRemaining, 'VND', 'vi-VN')}
                  </p>
                </div>
              </div>

              {/* Divider with OR */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-neutral-400 font-medium">hoặc</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>

              {/* Open PayOS */}
              {payment.checkoutUrl && (
                <a
                  href={payment.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-full border-2 border-primary-500 text-primary-600 font-semibold py-2.5 text-sm hover:bg-primary-50 transition-colors"
                >
                  <span>🔗</span>
                  Mở trang thanh toán PayOS
                </a>
              )}

              {/* Verify button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isVerifying}
                onClick={() => {
                  void handleVerify();
                }}
              >
                {isVerifying ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
              </Button>

              {/* Payment ref */}
              <div className="bg-neutral-50 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-neutral-400">Mã thanh toán</span>
                <span className="font-mono text-neutral-700 font-medium">{payment.paymentRef}</span>
              </div>
            </div>
          )}

          {/* Phase: form */}
          {phase === 'form' && (
            <form
              onSubmit={(e) => {
                void handleSubmit(onSubmit)(e);
              }}
              className="space-y-5"
            >
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
                <h1 className="text-xl font-bold text-neutral-900">Thông tin thanh toán</h1>

                {/* Room summary */}
                {booking.room && (
                  <div className="flex gap-3 bg-neutral-50 rounded-xl p-3">
                    {booking.room.imageUrl && (
                      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <img
                          src={booking.room.imageUrl}
                          alt={booking.room.name}
                          width={80}
                          height={64}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 text-sm truncate">
                        {booking.room.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {booking.room.roomTypeName && (
                          <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {booking.room.roomTypeName}
                          </span>
                        )}
                        {booking.room.floor && (
                          <span className="text-xs text-neutral-400">Tầng {booking.room.floor}</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-mono mt-0.5">
                        #{booking.room.code}
                      </p>
                    </div>
                  </div>
                )}

                {/* Prefilled info */}
                <div className="bg-neutral-50 rounded-xl p-4 space-y-2 text-sm">
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-2">
                    Thông tin người thanh toán
                  </p>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Họ tên</span>
                    <span className="font-medium text-neutral-900">
                      {user ? `${user.firstName} ${user.lastName}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="font-medium text-neutral-900">{user?.email ?? '—'}</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="0901 234 567"
                    {...register('buyerPhone')}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  {errors.buyerPhone && (
                    <p className="mt-1 text-xs text-red-500">{errors.buyerPhone.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="123 Nguyễn Huệ, Quận 1, TP. HCM"
                    {...register('buyerAddress')}
                    className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  {errors.buyerAddress && (
                    <p className="mt-1 text-xs text-red-500">{errors.buyerAddress.message}</p>
                  )}
                </div>

                {/* Payment method */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phương thức thanh toán <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['cash', 'card', 'transfer', 'wallet'] as PaymentMethodType[]).map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedMethod === method
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={method}
                          {...register('paymentMethod')}
                          className="sr-only"
                        />
                        <span className="text-lg">{PAYMENT_METHOD_ICONS[method]}</span>
                        <span
                          className={`text-sm font-medium ${
                            selectedMethod === method ? 'text-primary-700' : 'text-neutral-700'
                          }`}
                        >
                          {PAYMENT_METHOD_LABELS[method]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full"
              >
                Tạo mã QR thanh toán
              </Button>
            </form>
          )}
        </div>

        {/* Sidebar — booking summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 sticky top-20 space-y-4">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Tóm tắt đặt phòng
            </h2>

            {/* Room info */}
            {booking.room && (
              <div className="space-y-3">
                {booking.room.imageUrl && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={booking.room.imageUrl}
                      alt={booking.room.name}
                      width={400}
                      height={300}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-neutral-900 text-sm">{booking.room.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {booking.room.roomTypeName && (
                      <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {booking.room.roomTypeName}
                      </span>
                    )}
                    {booking.room.floor && (
                      <span className="text-xs text-neutral-400">Tầng {booking.room.floor}</span>
                    )}
                    <span className="text-xs text-neutral-400 font-mono">#{booking.room.code}</span>
                  </div>
                </div>
              </div>
            )}

            <div className={booking.room ? 'border-t border-neutral-100 pt-3' : ''}>
              <p className="font-mono text-xs text-neutral-400">{booking.bookingRef}</p>
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-neutral-700">
                <span>Nhận phòng</span>
                <span className="font-medium">{formatDate(booking.checkInDate)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Trả phòng</span>
                <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Số đêm</span>
                <span className="font-medium">{booking.nights} đêm</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Khách</span>
                <span className="font-medium">
                  {booking.adults} người lớn
                  {booking.children > 0 ? `, ${booking.children} trẻ em` : ''}
                </span>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>
                  {formatCurrency(booking.roomRatePerNight, 'VND', 'vi-VN')} × {booking.nights} đêm
                </span>
                <span>{formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-100 text-base">
                <span>Tổng cộng</span>
                <span className="text-primary-600">
                  {formatCurrency(booking.totalAmount, 'VND', 'vi-VN')}
                </span>
              </div>
            </div>

            {/* Status badges */}
            {phase === 'success' && (
              <div className="bg-green-50 text-green-700 rounded-full px-3 py-1.5 text-xs font-medium text-center">
                ✓ Đã thanh toán
              </div>
            )}
            {phase === 'qr' && !isExpired && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center space-y-1">
                <p className="text-xs text-amber-600 font-medium">⏳ Chờ thanh toán</p>
                <p
                  className={`text-lg font-bold font-mono tabular-nums ${
                    secondsLeft <= 30 ? 'text-red-600' : secondsLeft <= 60 ? 'text-amber-600' : 'text-primary-600'
                  }`}
                >
                  {formatCountdown(secondsLeft)}
                </p>
              </div>
            )}
            {phase === 'form' && !isExpired && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center space-y-1">
                <p className="text-xs text-primary-600 font-medium">⏱ Giữ phòng trong</p>
                <p
                  className={`text-lg font-bold font-mono tabular-nums ${
                    secondsLeft <= 30 ? 'text-red-600' : secondsLeft <= 60 ? 'text-amber-600' : 'text-primary-600'
                  }`}
                >
                  {formatCountdown(secondsLeft)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
