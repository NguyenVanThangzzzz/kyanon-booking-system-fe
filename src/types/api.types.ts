export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
