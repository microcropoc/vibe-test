import { apiClient } from '@/full/api/client';
import type { AuthResponse, TokenRefreshResponse, UserDto } from '@/types/api';

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>('/auth/login', payload),

  refresh: (refreshToken: string) =>
    apiClient.post<TokenRefreshResponse>('/auth/refresh', { refreshToken }, { skipAuthRetry: true }),

  me: () => apiClient.get<UserDto>('/auth/me'),
};
