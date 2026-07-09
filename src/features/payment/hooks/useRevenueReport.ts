import { useState, useEffect } from 'react';
import { paymentService } from '../services/payment.service';
import type { RevenueReport, RevenueReportParams } from '../types/payment.types';
import type { ApiError } from '@/types/api.types';

export const useRevenueReport = (params: RevenueReportParams) => {
  const [data, setData] = useState<RevenueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    paymentService
      .getRevenueReport(params)
      .then((report) => {
        if (!cancelled) setData(report);
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message ?? 'Không thể tải dữ liệu báo cáo');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.startDate, params.endDate, params.paymentMethod]);

  return { data, isLoading, error };
};
