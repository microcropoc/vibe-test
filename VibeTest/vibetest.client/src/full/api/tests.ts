import { apiClient } from '@/full/api/client';
import type {
  PagedResponse,
  SubmitResponse,
  TestDetailResponse,
  TestFullResponse,
  TestListItem,
  TestResponse,
  TestResultResponse,
  UserStatsResponse,
} from '@/types/api';
import type { TestDefinition } from '@/types';

export type CreateTestPayload = TestDefinition;
export type AddQuestionsPayload = { questions: TestDefinition['questions'] };
export type UpdateTestInfoPayload = { name: string; description?: string };
export type SubmitAnswerPayload = { questionOrder: number; selectedAnswerOrder: number };

export const testsApi = {
  getPublic: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<TestListItem>>(`/tests?page=${page}&pageSize=${pageSize}`),

  getDetail: (id: number) => apiClient.get<TestDetailResponse>(`/tests/${id}`),

  getFull: (id: number) => apiClient.get<TestFullResponse>(`/tests/${id}/full`),

  getMy: (page = 1, pageSize = 10, filter = 'all') =>
    apiClient.get<PagedResponse<TestListItem>>(
      `/tests/my?page=${page}&pageSize=${pageSize}&filter=${filter}`,
    ),

  getMyStats: () => apiClient.get<UserStatsResponse>('/tests/my/stats'),

  create: (payload: CreateTestPayload) =>
    apiClient.post<TestResponse>('/tests', payload),

  appendQuestions: (id: number, payload: AddQuestionsPayload) =>
    apiClient.patch<TestResponse>(`/tests/${id}`, payload),

  updateInfo: (id: number, payload: UpdateTestInfoPayload) =>
    apiClient.patch<TestResponse>(`/tests/${id}/info`, payload),

  fork: (id: number) => apiClient.post<TestResponse>(`/tests/${id}/fork`),

  publish: (id: number) => apiClient.put<void>(`/tests/${id}/publish`),

  unpublish: (id: number) => apiClient.put<void>(`/tests/${id}/unpublish`),

  delete: (id: number) => apiClient.delete(`/tests/${id}`),

  submitAnswer: (id: number, payload: SubmitAnswerPayload) =>
    apiClient.post<SubmitResponse>(`/tests/${id}/submit`, payload),

  getResult: (id: number) => apiClient.get<TestResultResponse>(`/tests/${id}/result`),

  deleteResult: (id: number) => apiClient.delete(`/tests/${id}/result`),
};
