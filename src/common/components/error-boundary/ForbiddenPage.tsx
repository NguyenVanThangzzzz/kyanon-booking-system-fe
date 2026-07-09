import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/common/components/ui/Button';

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-neutral-50">
      <div className="max-w-md">
        <p className="text-8xl font-bold text-primary-500">403</p>
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">Truy cập bị từ chối</h1>
        <p className="mt-2 text-neutral-500">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline">
            Quay lại
          </Button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 px-4 py-2 text-sm gap-2"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
