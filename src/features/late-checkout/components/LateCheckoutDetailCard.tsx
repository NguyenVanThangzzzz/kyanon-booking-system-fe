import { useState } from 'react';
import { Button } from '@/common/components/ui/Button';
import { useToast } from '@/common/components/ui/Toast/useToast';
import { formatCurrency, formatDateTime } from '@/common/utils/format';
import type { ApiError } from '@/types/api.types';
import { useLateCheckoutMutations } from '../hooks/useLateCheckoutMutations';
import type { LateCheckout } from '../types/late-checkout.types';
import { ApproveLateCheckoutModal } from './ApproveLateCheckoutModal';
import { DenyLateCheckoutModal } from './DenyLateCheckoutModal';
import { LateCheckoutStatusBadge } from './LateCheckoutStatusBadge';

interface LateCheckoutDetailCardProps {
  lateCheckout: LateCheckout;
  onUpdated: (updated: LateCheckout) => void;
}

export const LateCheckoutDetailCard = ({
  lateCheckout,
  onUpdated,
}: LateCheckoutDetailCardProps): JSX.Element => {
  const { showToast } = useToast();
  const { approve, deny } = useLateCheckoutMutations();
  const [approveOpen, setApproveOpen] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);

  const handleApprove = async (payload: {
    extra_charge: number;
    notes?: string;
  }): Promise<void> => {
    try {
      const updated = await approve(lateCheckout.id, payload);
      onUpdated(updated);
      setApproveOpen(false);
      showToast('Đã duyệt yêu cầu trả phòng muộn', 'success');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Không thể duyệt yêu cầu', 'error');
      throw err;
    }
  };

  const handleDeny = async (payload: { notes: string }): Promise<void> => {
    try {
      const updated = await deny(lateCheckout.id, payload);
      onUpdated(updated);
      setDenyOpen(false);
      showToast('Đã từ chối yêu cầu trả phòng muộn', 'info');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      showToast(apiError.message ?? 'Không thể từ chối yêu cầu', 'error');
      throw err;
    }
  };

  const canAct = lateCheckout.status === 'requested';

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Yêu cầu trả phòng muộn</h2>
          <p className="text-xs text-neutral-500 mt-0.5 font-mono">{lateCheckout.id}</p>
        </div>
        <LateCheckoutStatusBadge status={lateCheckout.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Booking ID</p>
          <p className="mt-0.5 font-mono text-neutral-700 break-all">{lateCheckout.bookingId}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Giờ chuẩn</p>
          <p className="mt-0.5 text-neutral-700">{lateCheckout.standardCheckOutTime}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Giờ yêu cầu</p>
          <p className="mt-0.5 font-semibold text-neutral-900">{lateCheckout.requestedUntil}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Phụ phí</p>
          <p className="mt-0.5 font-semibold text-primary-700">
            {lateCheckout.extraCharge > 0
              ? formatCurrency(lateCheckout.extraCharge, 'VND', 'vi-VN')
              : 'Miễn phí'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">Thời gian gửi</p>
          <p className="mt-0.5 text-neutral-700">{formatDateTime(lateCheckout.requestedAt)}</p>
        </div>
        {lateCheckout.approvedAt && (
          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">
              {lateCheckout.status === 'denied' ? 'Thời gian từ chối' : 'Thời gian duyệt'}
            </p>
            <p className="mt-0.5 text-neutral-700">{formatDateTime(lateCheckout.approvedAt)}</p>
          </div>
        )}
      </div>

      {lateCheckout.conflictsWithBookingId && (
        <div className="bg-warning-50 border border-warning-100 rounded-lg px-3 py-2 text-sm text-warning-700">
          ⚠ Booking này conflict với booking kế tiếp:{' '}
          <span className="font-mono">{lateCheckout.conflictsWithBookingId}</span>
        </div>
      )}

      {canAct && (
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
          <Button variant="danger" onClick={() => setDenyOpen(true)}>
            Từ chối
          </Button>
          <Button onClick={() => setApproveOpen(true)}>Duyệt</Button>
        </div>
      )}

      <ApproveLateCheckoutModal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        lateCheckout={lateCheckout}
        onSubmit={handleApprove}
      />
      <DenyLateCheckoutModal
        isOpen={denyOpen}
        onClose={() => setDenyOpen(false)}
        lateCheckout={lateCheckout}
        onSubmit={handleDeny}
      />
    </div>
  );
};
