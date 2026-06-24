export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserDto {
  id: number;
  displayName: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export type TestDifficulty = 'easy' | 'medium' | 'hard';

export interface TestListItem {
  id: number;
  name: string;
  description?: string;
  authorName: string;
  questionsCount: number;
  isPublic: boolean;
  difficulty: TestDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface TestResponse {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  difficulty: TestDifficulty;
  questionsCount: number;
  createdAt: string;
}

export interface AnswerDetailDto {
  order: number;
  text: string;
}

export interface QuestionDetailDto {
  order: number;
  text: string;
  answers: AnswerDetailDto[];
}

export interface TestDetailResponse {
  id: number;
  name: string;
  description?: string;
  authorName: string;
  questions: QuestionDetailDto[];
}

export interface QuestionFullDto {
  order: number;
  text: string;
  answers: string[];
  correct: number;
  explanation?: string;
}

export interface TestFullResponse {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  difficulty: TestDifficulty;
  questions: QuestionFullDto[];
}

export interface SubmitResponse {
  correctAnswerOrder: number;
  explanation?: string;
}

export interface TestResultResponse {
  testId: number;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  startedAt?: string;
  completedAt?: string;
}

export interface TestHistoryItem {
  testId: number;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  completedAt: string;
}

export interface UserStatsResponse {
  totalCreated: number;
  totalPublished: number;
  totalPassedOwn: number;
  totalPassedOthers: number;
  averageScoreOwn: number;
  averageScoreOthers: number;
}

export interface ApiErrorBody {
  error?: string;
}
