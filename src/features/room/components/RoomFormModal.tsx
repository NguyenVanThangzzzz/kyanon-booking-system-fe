import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/common/components/ui/Modal/Modal';
import { Input } from '@/common/components/ui/Input';
import { Button } from '@/common/components/ui/Button';
import { useRoomTypes } from '../hooks/useRoomTypes';
import type {
  CreateRoomRequest,
  Room,
  UpdateRoomRequest,
} from '../types/room.types';

const roomFormSchema = z.object({
  roomTypeId: z.string().min(1, 'Please select a room type'),
  name: z.string().min(1, 'Room name is required').max(100, 'Room name must be at most 100 characters'),
  code: z.string().min(1, 'Room code is required').max(20, 'Room code must be at most 20 characters'),
  capacity: z.coerce
    .number({ invalid_type_error: 'Capacity must be a number' })
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1'),
  floor: z
    .string()
    .max(10, 'Floor must be at most 10 characters')
    .optional()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .max(500, 'URL must be at most 500 characters')
    .optional()
    .or(z.literal('')),
  amenitiesText: z
    .string()
    .optional()
    .or(z.literal('')),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: Room | null;
  onSubmit: (data: CreateRoomRequest | UpdateRoomRequest) => Promise<void>;
}

const parseAmenities = (text: string): Record<string, unknown> | undefined => {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const result: Record<string, boolean> = {};
  trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((key) => {
      result[key] = true;
    });
  return Object.keys(result).length > 0 ? result : undefined;
};

const stringifyAmenities = (amenities: Room['amenities']): string => {
  if (!amenities || typeof amenities !== 'object') return '';
  return Object.entries(amenities)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .join(', ');
};

export const RoomFormModal = ({ isOpen, onClose, room, onSubmit }: RoomFormModalProps): JSX.Element => {
  const isEdit = Boolean(room);
  const { roomTypes, isLoading: typesLoading } = useRoomTypes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      roomTypeId: '',
      name: '',
      code: '',
      capacity: 1,
      floor: '',
      imageUrl: '',
      amenitiesText: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        roomTypeId: room?.roomTypeId ?? '',
        name: room?.name ?? '',
        code: room?.code ?? '',
        capacity: room?.capacity ?? 1,
        floor: room?.floor ?? '',
        imageUrl: room?.imageUrl ?? '',
        amenitiesText: stringifyAmenities(room?.amenities),
      });
    }
  }, [isOpen, room, reset]);

  const submitHandler = async (values: RoomFormValues): Promise<void> => {
    const payload: CreateRoomRequest = {
      roomTypeId: values.roomTypeId,
      name: values.name,
      code: values.code,
      capacity: values.capacity,
    };
    if (values.floor) payload.floor = values.floor;
    if (values.imageUrl) payload.imageUrl = values.imageUrl;
    const amenities = parseAmenities(values.amenitiesText ?? '');
    if (amenities) payload.amenities = amenities;
    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit room' : 'Add new room'} size="xl">
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="roomTypeId" className="form-label">
            Room type <span className="text-error-500">*</span>
          </label>
          <select
            id="roomTypeId"
            disabled={typesLoading}
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('roomTypeId')}
          >
            <option value="">-- Select room type --</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
          {errors.roomTypeId && <p className="form-error">{errors.roomTypeId.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Room name"
            required
            placeholder="E.g.: Deluxe Room 101"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Room code"
            required
            placeholder="E.g.: R101"
            error={errors.code?.message}
            {...register('code')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Capacity"
            type="number"
            min={1}
            required
            error={errors.capacity?.message}
            {...register('capacity')}
          />
          <Input
            label="Floor"
            placeholder="E.g.: 1, 2A, G"
            error={errors.floor?.message}
            {...register('floor')}
          />
        </div>

        <Input
          label="Image URL"
          placeholder="https://..."
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />

        <div>
          <label htmlFor="amenitiesText" className="form-label">
            Amenities
          </label>
          <textarea
            id="amenitiesText"
            rows={3}
            placeholder="Comma separated. E.g.: WiFi, Air Conditioning, Minibar"
            className="block w-full rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('amenitiesText')}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Update' : 'Create room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
