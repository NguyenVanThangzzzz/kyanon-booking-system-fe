import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardStats } from '../types/dashboard.types';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading, error };
};
