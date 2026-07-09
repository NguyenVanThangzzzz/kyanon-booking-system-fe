import { useState, useEffect } from 'react';
import { userService } from '../services/user.service';
import type { AuditLog, AuditLogParams } from '../types/user.types';
import type { ApiError } from '@/types/api.types';

interface UseAuditLogsReturn {
  logs: AuditLog[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export const useAuditLogs = (params: AuditLogParams): UseAuditLogsReturn => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    userService
      .getAuditLogs(params)
      .then((res) => {
        if (!cancelled) {
          setLogs(res.data.data);
          setTotal(res.data.pagination.total);
        }
      })
      .catch((err: ApiError) => {
        if (!cancelled) setError(err.message ?? 'Không thể tải nhật ký hoạt động');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    params.page,
    params.limit,
    params.action,
    params.resource,
    params.performedBy,
    params.startDate,
    params.endDate,
  ]);

  return { logs, total, isLoading, error };
};
