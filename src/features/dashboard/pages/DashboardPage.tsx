import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/StatCard';
import { useAuth } from '@/contexts/auth/useAuth';
import { formatCurrency } from '@/common/utils/format';
import { Spinner } from '@/common/components/ui/Spinner';
import { useRevenueReport } from '@/features/payment/hooks/useRevenueReport';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_START = `${CURRENT_YEAR}-01-01`;
const YEAR_END = `${CURRENT_YEAR}-12-31`;

const METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ tín dụng',
  transfer: 'Chuyển khoản',
  wallet: 'Ví điện tử',
};

const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-teal-400',
  card: 'bg-primary-500',
  transfer: 'bg-primary-600',
  wallet: 'bg-primary-700',
};

const formatVND = (amount: number) => formatCurrency(amount, 'VND', 'vi-VN');

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { stats, isLoading } = useDashboard();
  const { data: revenue, isLoading: revenueLoading } = useRevenueReport({
    startDate: YEAR_START,
    endDate: YEAR_END,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('nav.dashboard')}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Chào mừng trở lại, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Overview stat cards */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Tổng đặt phòng"
            value={stats.totalBookings}
            icon={<span className="text-xl">📋</span>}
          />
          <StatCard
            label="Đang hoạt động"
            value={stats.activeBookings}
            icon={<span className="text-xl">✅</span>}
          />
          <StatCard
            label="Doanh thu"
            value={formatVND(stats.totalRevenue)}
            icon={<span className="text-xl">💰</span>}
          />
          <StatCard
            label="Phòng trống"
            value={stats.availableRooms}
            icon={<span className="text-xl">🏨</span>}
          />
        </div>
      ) : null}

      {/* Revenue statistics section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-0.5">
              Thống kê doanh thu
            </p>
            <h2 className="text-lg font-semibold text-neutral-900">
              Tổng quan năm {CURRENT_YEAR}
            </h2>
          </div>
          <Link
            to="/dashboard/reports"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Xem chi tiết →
          </Link>
        </div>

        {revenueLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : revenue ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Key numbers */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
                <p className="text-xs font-medium text-neutral-500 mb-1">Tổng doanh thu năm</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatVND(revenue.totalRevenue)}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
                <p className="text-xs font-medium text-neutral-500 mb-1">Trung bình / đơn</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {formatVND(revenue.averageBookingValue)}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
                <p className="text-xs font-medium text-neutral-500 mb-1">Tổng đơn đặt phòng</p>
                <p className="text-2xl font-bold text-neutral-900">{revenue.totalBookings}</p>
              </div>
            </div>

            {/* Payment method breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <p className="text-sm font-semibold text-neutral-900 mb-5">
                Phân bổ phương thức thanh toán
              </p>

              {revenue.paymentMethodBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm text-neutral-500">Chưa có giao dịch nào trong năm nay</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {revenue.paymentMethodBreakdown.map((item, i) => (
                    <div key={item.method}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 font-medium text-neutral-700">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              METHOD_COLORS[item.method] ?? 'bg-neutral-400'
                            }`}
                          />
                          {METHOD_LABELS[item.method] ?? item.method}
                        </span>
                        <span className="text-neutral-500">
                          {formatVND(item.amount)}{' '}
                          <span className="text-xs text-neutral-400">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            ['bg-teal-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700'][
                              i % 4
                            ]
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{item.count} giao dịch</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/dashboard/rooms"
            className="bg-white rounded-2xl shadow-sm border border-neutral-200 group flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
          >
            <div className="rounded-xl bg-primary-50 p-3 text-2xl">🏨</div>
            <div>
              <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                Quản lý phòng
              </p>
              <p className="text-sm text-neutral-500">Xem và quản lý tất cả phòng</p>
            </div>
          </Link>
          <Link
            to="/dashboard/bookings"
            className="bg-white rounded-2xl shadow-sm border border-neutral-200 group flex items-center gap-4 p-4 transition-shadow hover:shadow-md"
          >
            <div className="rounded-xl bg-primary-50 p-3 text-2xl">📋</div>
            <div>
              <p className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                Đặt phòng
              </p>
              <p className="text-sm text-neutral-500">Theo dõi tất cả đơn đặt phòng</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
