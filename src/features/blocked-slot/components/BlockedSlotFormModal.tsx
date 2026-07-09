import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';
import { Modal } from '@/common/components/ui/Modal/Modal';
import type {
  BlockedSlot,
  BlockedSlotReason,
  CreateBlockedSlotRequest,
  UpdateBlockedSlotRequest,
} from '../types/blocked-slot.types';
import { REASON_LABELS_VI } from '../types/blocked-slot.types';

const REASON_VALUES = ['maintenance', 'cleaning', 'event', 'other'] as const;

const blockedSlotFormSchema = z
  .object({
    startAt: z.string().min(1, 'Please select a start time'),
    endAt: z.string().min(1, 'Please select an end time'),
    reason: z.enum(REASON_VALUES, { required_error: 'Please select a reason' }),
    notes: z.string().max(500, 'Notes must be at most 500 characters').optional().or(z.literal('')),
  })
  .refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

type BlockedSlotFormValues = z.infer<typeof blockedSlotFormSchema>;

interface BlockedSlotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot?: BlockedSlot | null;
  onSubmit: (data: CreateBlockedSlotRequest | UpdateBlockedSlotRequest) => Promise<void>;
}

const toDatetimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIsoString = (datetimeLocal: string): string => {
  return new Date(datetimeLocal).toISOString();
};

export const BlockedSlotFormModal = ({
  isOpen,
  onClose,
  slot,
  onSubmit,
}: BlockedSlotFormModalProps): JSX.Element => {
  const isEdit = Boolean(slot);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlockedSlotFormValues>({
    resolver: zodResolver(blockedSlotFormSchema),
    defaultValues: {
      startAt: '',
      endAt: '',
      reason: 'maintenance',
      notes: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        startAt: toDatetimeLocal(slot?.startAt),
        endAt: toDatetimeLocal(slot?.endAt),
        reason: (slot?.reason as BlockedSlotReason | undefined) ?? 'maintenance',
        notes: slot?.notes ?? '',
      });
    }
  }, [isOpen, slot, reset]);

  const submitHandler = async (values: BlockedSlotFormValues): Promise<void> => {
    const payload: CreateBlockedSlotRequest = {
      startAt: toIsoString(values.startAt),
      endAt: toIsoString(values.endAt),
      reason: values.reason,
    };
    if (values.notes) payload.notes = values.notes;
    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit blocked slot' : 'Add blocked slot'}
      size="lg"
    >
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startAt" className="block text-sm font-medium text-neutral-700 mb-1">
              Start <span className="text-error-500">*</span>
            </label>
            <input
              id="startAt"
              type="datetime-local"
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('startAt')}
            />
            {errors.startAt && (
              <p className="text-xs text-error-600 mt-1">{errors.startAt.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="endAt" className="block text-sm font-medium text-neutral-700 mb-1">
              End <span className="text-error-500">*</span>
            </label>
            <input
              id="endAt"
              type="datetime-local"
              className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('endAt')}
            />
            {errors.endAt && (
              <p className="text-xs text-error-600 mt-1">{errors.endAt.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-neutral-700 mb-1">
            Reason <span className="text-error-500">*</span>
          </label>
          <select
            id="reason"
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('reason')}
          >
            {REASON_VALUES.map((r) => (
              <option key={r} value={r}>
                {REASON_LABELS_VI[r]}
              </option>
            ))}
          </select>
          {errors.reason && (
            <p className="text-xs text-error-600 mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Additional description of the block reason (optional)"
            className="block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('notes')}
          />
          {errors.notes && (
            <p className="text-xs text-error-600 mt-1">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update' : 'Create blocked slot'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
