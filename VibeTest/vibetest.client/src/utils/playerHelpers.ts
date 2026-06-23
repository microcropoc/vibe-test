import type { QuestionDefinition } from '@/types';
import type { PlayerQuestion } from '@/types/player';
import { normalizeQuestions } from '@/utils/normalizeQuestions';

export function toPlayerQuestions(questions: QuestionDefinition[]): PlayerQuestion[] {
  const normalized = normalizeQuestions(questions);
  return normalized.map((q, order) => ({
    order,
    text: q.text,
    answers: q.answers.map((text, answerOrder) => ({
      order: answerOrder,
      text,
    })),
  }));
}

export function getCorrectAnswerOrder(question: QuestionDefinition): number {
  return normalizeQuestions([question])[0].correct;
}

export function countAnswered(progress: { answers: Record<number, unknown> }): number {
  return Object.keys(progress.answers).length;
}

export function countCorrect(progress: {
  answers: Record<number, { isCorrect: boolean }>;
}): number {
  return Object.values(progress.answers).filter((a) => a.isCorrect).length;
}

export function isTestFullyAnswered(
  totalQuestions: number,
  progress: { answers: Record<number, unknown> },
): boolean {
  return countAnswered(progress) >= totalQuestions;
}

export function scorePercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export interface TestProgressStats {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
}

export function getTestProgressStats(
  totalQuestions: number,
  progress: { answers: Record<number, { isCorrect: boolean }> } | null,
): TestProgressStats {
  const answered = progress ? countAnswered(progress) : 0;
  const correct = progress ? countCorrect(progress) : 0;
  return {
    total: totalQuestions,
    answered,
    correct,
    incorrect: answered - correct,
  };
}
