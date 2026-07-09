import { useState } from 'react';
import { Modal } from '@/common/components/ui/Modal';
import { Button } from '@/common/components/ui/Button';
import type { CancelReason } from '../types/booking.types';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonType: CancelReason, reasonNote?: string) => Promise<void>;
  isLoading?: boolean;
  checkInDate: string;
  totalAmount: number;
  /** Admin mode: shows all 4 reason types and defaults to 'admin' */
  isAdmin?: boolean;
}

const USER_REASON_OPTIONS: Array<{ value: CancelReason; label: string }> = [
  { value: 'user_request', label: 'Thay đổi lịch trình cá nhân' },
  { value: 'room_issue', label: 'Vấn đề với phòng / dịch vụ' },
];

const ADMIN_REASON_OPTIONS: Array<{ value: CancelReason; label: string }> = [
  { value: 'admin', label: 'Quyết định của quản trị viên' },
  { value: 'room_issue', label: 'Vấn đề với phòng / dịch vụ (hoàn 100%)' },
  { value: 'user_request', label: 'Theo yêu cầu của khách' },
  { value: 'no_show', label: 'Khách không đến' },
];

const REFUND_TIERS = [
  { condition: 'Hủy trong vòng 1 giờ sau khi đặt', percent: 100 },
  { condition: 'Hủy trước 7 ngày nhận phòng', percent: 100 },
  { condition: 'Hủy 3–6 ngày trước nhận phòng', percent: 70 },
  { condition: 'Hủy 1–2 ngày trước nhận phòng', percent: 30 },
  { condition: 'Hủy cùng ngày nhận phòng', percent: 0 },
];

const calcRefundPercent = (checkInDate: string): number => {
  const now = new Date();
  const checkIn = new Date(checkInDate);
  const diffMs = checkIn.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays >= 7) return 100;
  if (diffDays >= 3) return 70;
  if (diffDays >= 1) return 30;
  return 0;
};

export const CancelBookingModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  checkInDate,
  totalAmount,
  isAdmin = false,
}: CancelBookingModalProps) => {
  const REASON_OPTIONS = isAdmin ? ADMIN_REASON_OPTIONS : USER_REASON_OPTIONS;
  const [reasonType, setReasonType] = useState<CancelReason>(isAdmin ? 'admin' : 'user_request');
  const [reasonNote, setReasonNote] = useState('');

  const refundPercent =
    reasonType === 'room_issue' ? 100 : calcRefundPercent(checkInDate);
  const refundAmount = Math.floor((totalAmount * refundPercent) / 100);

  const handleConfirm = async (): Promise<void> => {
    await onConfirm(reasonType, reasonNote.trim() || undefined);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdmin ? 'Hủy đặt phòng (Admin)' : 'Hủy đặt phòng'}
      size="md"
    >
      <div className="space-y-5">
        {/* Refund preview */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm">
          <p className="font-semibold text-amber-800 mb-2">Chính sách hoàn tiền</p>
          <ul className="space-y-1 text-amber-700 text-xs">
            {REFUND_TIERS.map((tier) => (
              <li key={tier.condition} className="flex justify-between gap-4">
                <span>{tier.condition}</span>
                <span className="font-medium whitespace-nowrap">{tier.percent}%</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t border-amber-200 flex justify-between font-semibold text-amber-900">
            <span>Dự kiến hoàn lại</span>
            <span className="text-primary-700">
              {refundPercent}% ≈ {refundAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Lý do hủy <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {REASON_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="reasonType"
                  value={opt.value}
                  checked={reasonType === opt.value}
                  onChange={() => setReasonType(opt.value)}
                  className="h-4 w-4 accent-primary-600"
                />
                <span className="text-sm text-neutral-700 group-hover:text-neutral-900">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Ghi chú thêm <span className="text-neutral-400 font-normal">(tuỳ chọn)</span>
          </label>
          <textarea
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Nhập ghi chú nếu có..."
            className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1">
            {isAdmin ? 'Hủy bỏ' : 'Giữ đặt phòng'}
          </Button>
          <Button
            variant="danger"
            onClick={() => { void handleConfirm(); }}
            isLoading={isLoading}
            className="flex-1"
          >
            Xác nhận hủy
          </Button>
        </div>
      </div>
    </Modal>
  );
};
