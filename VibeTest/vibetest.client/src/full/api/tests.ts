import { apiClient } from '@/full/api/client';
import type {
  PagedResponse,
  AnsweredQuestionsResponse,
  SubmitResponse,
  TestDetailResponse,
  TestFullResponse,
  TestListItem,
  TestProgressListResponse,
  TestResponse,
  TestResultResponse,
  UserStatsResponse,
} from '@/types/api';
import type { TestDefinition } from '@/types';

export type CreateTestPayload = TestDefinition;
export type AddQuestionsPayload = { questions: TestDefinition['questions'] };
export type UpdateTestInfoPayload = { name: string; description?: string; difficulty?: import('@/types').TestDifficulty };
export type SubmitAnswerPayload = { questionOrder: number; selectedAnswerOrder: number };

export const testsApi = {
  getPublic: (page = 1, pageSize = 10, sortBy = 'updatedAt', order = 'desc') =>
    apiClient.get<PagedResponse<TestListItem>>(
      `/tests?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}`,
    ),

  getDetail: (id: number) => apiClient.get<TestDetailResponse>(`/tests/${id}`),

  getFull: (id: number) => apiClient.get<TestFullResponse>(`/tests/${id}/full`),

  getMy: (page = 1, pageSize = 10, filter = 'all', sortBy = 'updatedAt', order = 'desc') =>
    apiClient.get<PagedResponse<TestListItem>>(
      `/tests/my?page=${page}&pageSize=${pageSize}&filter=${filter}&sortBy=${sortBy}&order=${order}`,
    ),

  getMyStats: () => apiClient.get<UserStatsResponse>('/tests/my/stats'),

  getProgress: (ids: number[]) => {
    if (ids.length === 0) {
      return Promise.resolve({ items: [] } satisfies TestProgressListResponse);
    }
    const query = ids.map((id) => `ids=${id}`).join('&');
    return apiClient.get<TestProgressListResponse>(`/tests/progress?${query}`);
  },

  getPublicPlay: (id: number) => apiClient.get<TestFullResponse>(`/tests/${id}/play-public`),

  create: (payload: CreateTestPayload) =>
    apiClient.post<TestResponse>('/tests', payload),

  appendQuestions: (id: number, payload: AddQuestionsPayload) =>
    apiClient.patch<TestResponse>(`/tests/${id}`, payload),

  updateInfo: (id: number, payload: UpdateTestInfoPayload) =>
    apiClient.patch<TestResponse>(`/tests/${id}/info`, payload),

  publish: (id: number) => apiClient.put<void>(`/tests/${id}/publish`),

  unpublish: (id: number) => apiClient.put<void>(`/tests/${id}/unpublish`),

  delete: (id: number) => apiClient.delete(`/tests/${id}`),

  submitAnswer: (id: number, payload: SubmitAnswerPayload) =>
    apiClient.post<SubmitResponse>(`/tests/${id}/submit`, payload),

  getAnswers: (id: number) => apiClient.get<AnsweredQuestionsResponse>(`/tests/${id}/answers`),

  getResult: (id: number) => apiClient.get<TestResultResponse>(`/tests/${id}/result`),

  deleteResult: (id: number) => apiClient.delete(`/tests/${id}/result`),
};
