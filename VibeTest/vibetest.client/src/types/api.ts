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

export interface AnsweredQuestionResponse {
  questionOrder: number;
  selectedAnswerOrder: number;
  correctAnswerOrder: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface AnsweredQuestionsResponse {
  answers: AnsweredQuestionResponse[];
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

export interface TestProgressResponse {
  testId: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  startedAt?: string;
  completedAt?: string;
}

export interface TestProgressListResponse {
  items: TestProgressResponse[];
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

export type ApplicationType = 'link' | 'internalUser';

export interface ApplicationResponse {
  id: number;
  token: string;
  title: string;
  type: ApplicationType;
  testId: number;
  testName: string;
  createdAt: string;
  hideResultsFromParticipant: boolean;
  playUrl: string;
}

export interface ApplicationListItem {
  id: number;
  token: string;
  title: string;
  type: ApplicationType;
  testId: number;
  testName: string;
  createdAt: string;
  isCompleted: boolean;
  correctAnswers: number;
  totalQuestions: number;
  scorePercent: number;
  completedAt?: string;
  hideResultsFromParticipant: boolean;
  recipientUserId?: number;
  playUrl: string;
}

export interface IncomingApplicationListItem {
  id: number;
  token: string;
  title: string;
  authorName: string;
  testId: number;
  testName: string;
  createdAt: string;
  isCompleted: boolean;
  hideResultsFromParticipant: boolean;
  playUrl: string;
}

export interface UserSearchResult {
  id: number;
  displayName: string;
}

export interface ApplicationPlayResponse {
  title: string;
  hideResultsFromParticipant: boolean;
  isCompleted: boolean;
  id: number;
  name: string;
  description?: string;
  authorName: string;
  questions: QuestionDetailDto[];
}
