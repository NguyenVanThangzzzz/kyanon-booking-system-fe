import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

export const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
}: UsePaginationOptions = {}): UsePaginationReturn => {
  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => setPageState((p) => p + 1), []);
  const prevPage = useCallback(() => setPageState((p) => Math.max(1, p - 1)), []);
  const resetPage = useCallback(() => setPageState(initialPage), [initialPage]);

  return { page, limit, setPage, setLimit, nextPage, prevPage, resetPage };
};
