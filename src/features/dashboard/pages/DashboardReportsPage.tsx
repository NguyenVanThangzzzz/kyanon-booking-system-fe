import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useRevenueReport } from '@/features/payment/hooks/useRevenueReport';
import { StatCard } from '../components/StatCard';
import { Spinner } from '@/common/components/ui/Spinner';
import { Button } from '@/common/components/ui/Button';
import { formatCurrency, formatDate } from '@/common/utils/format';
import type { PaymentMethodType } from '@/features/payment/types/payment.types';

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_START = `${CURRENT_YEAR}-01-01`;
const DEFAULT_END = `${CURRENT_YEAR}-12-31`;

const METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ tín dụng',
  transfer: 'Chuyển khoản',
  wallet: 'Ví điện tử',
};

const PIE_COLORS = ['#14b8a6', '#0d9488', '#0f766e', '#99f6e4'];

const inputClass =
  'block w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

const formatVND = (value: number) => formatCurrency(value, 'VND', 'vi-VN');

interface AppliedParams {
  startDate: string;
  endDate: string;
  paymentMethod: PaymentMethodType | '';
}

export const DashboardReportsPage = () => {
  const [startDate, setStartDate] = useState(DEFAULT_START);
  const [endDate, setEndDate] = useState(DEFAULT_END);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType | ''>('');
  const [applied, setApplied] = useState<AppliedParams>({
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
    paymentMethod: '',
  });

  const { data, isLoading, error } = useRevenueReport({
    startDate: applied.startDate,
    endDate: applied.endDate,
    paymentMethod: applied.paymentMethod || undefined,
  });

  const handleApply = () => setApplied({ startDate, endDate, paymentMethod });

  const pieData = data?.paymentMethodBreakdown.map((b) => ({
    ...b,
    name: METHOD_LABELS[b.method] ?? b.method,
  }));

  const barData = data?.paymentMethodBreakdown.map((b) => ({
    name: METHOD_LABELS[b.method] ?? b.method,
    'Doanh thu': b.amount,
    'Giao dịch': b.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Báo cáo doanh thu</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Thống kê doanh thu và phân tích thanh toán theo kỳ
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-neutral-500 mb-1">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Phương thức thanh toán
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethodType | '')}
              className={inputClass}
            >
              <option value="">Tất cả</option>
              <option value="cash">Tiền mặt</option>
              <option value="card">Thẻ tín dụng</option>
              <option value="transfer">Chuyển khoản</option>
              <option value="wallet">Ví điện tử</option>
            </select>
          </div>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-neutral-900">Không tải được dữ liệu</h3>
          <p className="text-neutral-500 mt-1">{error}</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && data && (
        <>
          {/* Period label */}
          <p className="text-xs text-neutral-400">
            Kỳ báo cáo: {formatDate(data.periodSummary.startDate)} –{' '}
            {formatDate(data.periodSummary.endDate)}
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Tổng doanh thu"
              value={formatVND(data.totalRevenue)}
              icon={<span className="text-xl">💰</span>}
            />
            <StatCard
              label="Tổng đơn đặt phòng"
              value={data.totalBookings}
              icon={<span className="text-xl">📋</span>}
            />
            <StatCard
              label="Trung bình / đơn"
              value={formatVND(data.averageBookingValue)}
              icon={<span className="text-xl">📊</span>}
            />
          </div>

          {data.paymentMethodBreakdown.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-neutral-900">Chưa có dữ liệu</h3>
              <p className="text-neutral-500 mt-1">Không có giao dịch nào trong kỳ này</p>
            </div>
          ) : (
            <>
              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                  <h2 className="text-base font-semibold text-neutral-900 mb-4">
                    Phân bổ theo phương thức thanh toán
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                        labelLine={false}
                      >
                        {pieData?.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatVND(value), 'Doanh thu']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                  <h2 className="text-base font-semibold text-neutral-900 mb-4">
                    Doanh thu theo phương thức
                  </h2>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#78716c' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          v >= 1_000_000
                            ? `${(v / 1_000_000).toFixed(1)}M`
                            : v >= 1_000
                              ? `${(v / 1_000).toFixed(0)}K`
                              : String(v)
                        }
                      />
                      <Tooltip formatter={(value: number) => [formatVND(value), 'Doanh thu']} />
                      <Bar dataKey="Doanh thu" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200">
                  <h2 className="text-base font-semibold text-neutral-900">
                    Chi tiết phương thức thanh toán
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left">
                        <th className="px-6 py-3 font-medium text-neutral-500">Phương thức</th>
                        <th className="px-6 py-3 font-medium text-neutral-500 text-right">
                          Số giao dịch
                        </th>
                        <th className="px-6 py-3 font-medium text-neutral-500 text-right">
                          Doanh thu
                        </th>
                        <th className="px-6 py-3 font-medium text-neutral-500 text-right">
                          Tỷ lệ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {data.paymentMethodBreakdown.map((item, i) => (
                        <tr key={item.method} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-neutral-900 flex items-center gap-2">
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            {METHOD_LABELS[item.method] ?? item.method}
                          </td>
                          <td className="px-6 py-4 text-right text-neutral-700">{item.count}</td>
                          <td className="px-6 py-4 text-right font-semibold text-neutral-900">
                            {formatVND(item.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                              {item.percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-neutral-50 border-t-2 border-neutral-200">
                        <td className="px-6 py-3 font-semibold text-neutral-900">Tổng cộng</td>
                        <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                          {data.totalBookings}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-primary-600">
                          {formatVND(data.totalRevenue)}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                          100%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
