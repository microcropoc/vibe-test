import type { TestDifficulty } from './api';

export type { TestDifficulty } from './api';

export interface QuestionDefinition {
  text: string;
  answers: string[];
  correct: number;
  explanation?: string;
}

export interface TestDefinition {
  name: string;
  description?: string;
  difficulty?: TestDifficulty;
  questions: QuestionDefinition[];
}

/** Local test stored in localStorage (guest mode). */
export interface LocalTest extends TestDefinition {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestProgress {
  answers: Record<number, import('./player').QuestionAnswerRecord>;
  currentQuestionOrder: number;
  updatedAt: string;
}

export interface GuestTestResult {
  testId: string;
  testName: string;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
}

export type {
  PlayerAnswer,
  PlayerPhase,
  PlayerProgress,
  PlayerQuestion,
  QuestionAnswerRecord,
} from './player';

export type {
  ApiErrorBody,
  ApplicationListItem,
  ApplicationPlayResponse,
  ApplicationResponse,
  ApplicationType,
  AuthResponse,
  IncomingApplicationListItem,
  PagedResponse,
  QuestionDetailDto,
  QuestionFullDto,
  SubmitResponse,
  TestDetailResponse,
  TestFullResponse,
  TestHistoryItem,
  TestListItem,
  TestResponse,
  TestResultResponse,
  TokenRefreshResponse,
  UserDto,
  UserSearchResult,
  UserStatsResponse,
} from './api';
