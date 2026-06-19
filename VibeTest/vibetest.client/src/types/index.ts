export interface AnswerDefinition {
  text: string;
  isCorrect: boolean;
}

export interface QuestionDefinition {
  text: string;
  answers: AnswerDefinition[];
}

export interface TestDefinition {
  name: string;
  description?: string;
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
  AuthResponse,
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
  UserStatsResponse,
} from './api';
