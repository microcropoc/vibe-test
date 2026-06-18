import { apiClient } from '@/full/api/client';
import type { PagedResponse, TestHistoryItem } from '@/types/api';

export const resultsApi = {
  getHistory: (page = 1, pageSize = 20, sortBy = 'date', order = 'desc') =>
    apiClient.get<PagedResponse<TestHistoryItem>>(
      `/results?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}`,
    ),
};
