import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/common/components/ui/Button';

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const lookupSchema = z.object({
  bookingId: z
    .string()
    .min(1, 'Vui lòng nhập mã booking')
    .regex(UUID_REGEX, 'Mã booking phải có định dạng UUID hợp lệ'),
});

type LookupFormValues = z.infer<typeof lookupSchema>;

interface LateCheckoutLookupFormProps {
  onLookup: (bookingId: string) => Promise<void>;
  isLoading: boolean;
}

export const LateCheckoutLookupForm = ({
  onLookup,
  isLoading,
}: LateCheckoutLookupFormProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { bookingId: '' },
  });

  const submitHandler = async (values: LookupFormValues): Promise<void> => {
    await onLookup(values.bookingId.trim());
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(submitHandler)(e)}
      className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3"
      noValidate
    >
      <div>
        <label htmlFor="bookingId" className="block text-sm font-medium text-neutral-700 mb-1">
          Mã booking
        </label>
        <p className="text-xs text-neutral-500 mb-2">
          Nhập UUID booking để tra cứu yêu cầu trả phòng muộn liên quan.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="bookingId"
            type="text"
            placeholder="VD: 4c8b1234-...-9f1e"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            {...register('bookingId')}
            disabled={isLoading}
          />
          <Button type="submit" isLoading={isLoading}>
            Tra cứu
          </Button>
        </div>
        {errors.bookingId && (
          <p className="text-xs text-error-600 mt-1">{errors.bookingId.message}</p>
        )}
      </div>
    </form>
  );
};
