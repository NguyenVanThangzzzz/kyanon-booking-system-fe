import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/common/components/ui/Modal/Modal';
import { Input } from '@/common/components/ui/Input';
import { Button } from '@/common/components/ui/Button';
import type { CreateStaffRequest } from '../types/user.types';

const schema = z.object({
  lastName: z.string().min(1, 'Vui lòng nhập họ'),
  firstName: z.string().min(1, 'Vui lòng nhập tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  phone: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffRequest) => Promise<void>;
}

export const CreateStaffModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateStaffModalProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { lastName: '', firstName: '', email: '', password: '', phone: '' },
  });

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  const submitHandler = async (values: FormValues): Promise<void> => {
    const payload: CreateStaffRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    };
    if (values.phone) payload.phone = values.phone;
    try {
      await onSubmit(payload);
      onClose();
    } catch {
      // Parent already showed error toast; keep modal open so user can retry
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm nhân viên mới" size="md">
      <form onSubmit={(e) => void handleSubmit(submitHandler)(e)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Họ"
            required
            placeholder="Nguyễn"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          <Input
            label="Tên"
            required
            placeholder="Văn A"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
        </div>
        <Input
          label="Email"
          type="email"
          required
          placeholder="nhanvien@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Mật khẩu"
          type="password"
          required
          placeholder="Tối thiểu 8 ký tự"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Số điện thoại"
          type="tel"
          placeholder="0909 000 000"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Thêm nhân viên
          </Button>
        </div>
      </form>
    </Modal>
  );
};
