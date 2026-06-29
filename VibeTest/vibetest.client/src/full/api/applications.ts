import { apiClient } from '@/full/api/client';
import type {
  ApplicationListItem,
  ApplicationPlayResponse,
  ApplicationResponse,
  PagedResponse,
  SubmitResponse,
  TestResultResponse,
} from '@/types/api';
import type { SubmitAnswerPayload } from '@/full/api/tests';

export type CreateApplicationPayload = {
  participantName: string;
  testId: number;
  hideResultsFromParticipant?: boolean;
};

export const applicationsApi = {
  create: (payload: CreateApplicationPayload) =>
    apiClient.post<ApplicationResponse>('/applications', payload),

  getMy: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<ApplicationListItem>>(
      `/applications?page=${page}&pageSize=${pageSize}`,
    ),

  getDetail: (token: string) =>
    apiClient.get<ApplicationPlayResponse>(`/applications/${token}`),

  submitAnswer: (token: string, payload: SubmitAnswerPayload) =>
    apiClient.post<SubmitResponse>(`/applications/${token}/submit`, payload),

  getResult: (token: string) =>
    apiClient.get<TestResultResponse>(`/applications/${token}/result`),
};
