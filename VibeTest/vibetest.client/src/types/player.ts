export interface PlayerAnswer {
  order: number;
  text: string;
}

export interface PlayerQuestion {
  order: number;
  text: string;
  answers: PlayerAnswer[];
}

export interface QuestionAnswerRecord {
  selectedAnswerOrder: number;
  correctAnswerOrder: number;
  isCorrect: boolean;
}

export interface PlayerProgress {
  answers: Record<number, QuestionAnswerRecord>;
  currentQuestionOrder: number;
  updatedAt: string;
}

export type PlayerPhase =
  | 'loading'
  | 'answering'
  | 'checking'
  | 'result'
  | 'completed'
  | 'unresolved';
