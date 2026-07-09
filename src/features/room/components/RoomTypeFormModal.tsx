import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/common/components/ui/Modal/Modal';
import { Input } from '@/common/components/ui/Input';
import { Button } from '@/common/components/ui/Button';
import type {
  CreateRoomTypeRequest,
  RoomType,
  UpdateRoomTypeRequest,
} from '../types/room.types';

const roomTypeFormSchema = z.object({
  name: z.string().min(1, 'Room type name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().optional().or(z.literal('')),
  defaultCapacity: z.coerce
    .number({ invalid_type_error: 'Capacity must be a number' })
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1'),
  basePricePerNight: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0'),
});

type RoomTypeFormValues = z.infer<typeof roomTypeFormSchema>;

interface RoomTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomType?: RoomType | null;
  onSubmit: (data: CreateRoomTypeRequest | UpdateRoomTypeRequest) => Promise<void>;
}

export const RoomTypeFormModal = ({
  isOpen,
  onClose,
  roomType,
  onSubmit,
}: RoomTypeFormModalProps): JSX.Element => {
  const isEdit = Boolean(roomType);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomTypeFormValues>({
    resolver: zodResolver(roomTypeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultCapacity: 2,
      basePricePerNight: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: roomType?.name ?? '',
        description: roomType?.description ?? '',
        defaultCapacity: roomType?.defaultCapacity ?? 2,
        basePricePerNight: roomType?.basePricePerNight ?? 0,
      });
    }
  }, [isOpen, roomType, reset]);

  const submitHandler = async (values: RoomTypeFormValues): Promise<void> => {
    const payload: CreateRoomTypeRequest = {
      name: values.name,
      defaultCapacity: values.defaultCapacity,
      basePricePerNight: values.basePricePerNight,
    };
    if (values.description) payload.description = values.description;
    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit room type' : 'Add new room type'}
      size="lg"
    >
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <Input
          label="Room type name"
          required
          placeholder="E.g.: Deluxe Room"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Detailed description of the room type..."
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Default capacity"
            type="number"
            min={1}
            required
            error={errors.defaultCapacity?.message}
            {...register('defaultCapacity')}
          />
          <Input
            label="Price / night (USD)"
            type="number"
            min={0}
            step={1}
            required
            placeholder="500"
            error={errors.basePricePerNight?.message}
            {...register('basePricePerNight')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update' : 'Create room type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
