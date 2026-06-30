import { apiClient } from '@/full/api/client';
import type { UserSearchResult } from '@/types/api';

export const usersApi = {
  search: (q: string, limit = 10) =>
    apiClient.get<UserSearchResult[]>(
      `/users/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    ),
};
