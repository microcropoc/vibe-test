import { apiClient } from '@/full/api/client';
import type {
  ApplicationListItem,
  ApplicationPlayResponse,
  ApplicationResponse,
  ApplicationType,
  AnsweredQuestionsResponse,
  IncomingApplicationListItem,
  PagedResponse,
  SubmitResponse,
  TestResultResponse,
} from '@/types/api';
import type { SubmitAnswerPayload } from '@/full/api/tests';

export type CreateApplicationPayload = {
  title: string;
  type: ApplicationType;
  testId: number;
  hideResultsFromParticipant?: boolean;
  recipientUserId?: number;
};

export const applicationsApi = {
  create: (payload: CreateApplicationPayload) =>
    apiClient.post<ApplicationResponse>('/applications', payload),

  getMy: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<ApplicationListItem>>(
      `/applications?page=${page}&pageSize=${pageSize}`,
    ),

  getIncoming: (page = 1, pageSize = 10) =>
    apiClient.get<PagedResponse<IncomingApplicationListItem>>(
      `/applications/incoming?page=${page}&pageSize=${pageSize}`,
    ),

  getDetail: (token: string) =>
    apiClient.get<ApplicationPlayResponse>(`/applications/${token}`),

  submitAnswer: (token: string, payload: SubmitAnswerPayload) =>
    apiClient.post<SubmitResponse>(`/applications/${token}/submit`, payload),

  getAnswers: (token: string) =>
    apiClient.get<AnsweredQuestionsResponse>(`/applications/${token}/answers`),

  getResult: (token: string) =>
    apiClient.get<TestResultResponse>(`/applications/${token}/result`),
};
