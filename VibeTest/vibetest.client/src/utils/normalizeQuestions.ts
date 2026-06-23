import type { QuestionDefinition } from '@/types';

/** Coerce legacy/object answer shapes (`{ text, isCorrect }`) to plain strings. */
export function normalizeAnswerText(answer: unknown): string {
  if (typeof answer === 'string') return answer;
  if (answer && typeof answer === 'object' && 'text' in answer) {
    const text = (answer as { text: unknown }).text;
    if (typeof text === 'string') return text;
  }
  return '';
}

export function normalizeQuestion(question: QuestionDefinition): QuestionDefinition {
  const rawAnswers = question.answers as unknown[];
  const answers = rawAnswers.map(normalizeAnswerText);
  let correct = question.correct;

  const correctFromFlag = rawAnswers.findIndex(
    (a) =>
      a &&
      typeof a === 'object' &&
      'isCorrect' in a &&
      (a as { isCorrect: unknown }).isCorrect === true,
  );
  if (correctFromFlag >= 0) {
    correct = correctFromFlag;
  }

  if (correct < 0 || correct >= answers.length) {
    correct = 0;
  }

  return { ...question, answers, correct };
}

export function normalizeQuestions(questions: QuestionDefinition[]): QuestionDefinition[] {
  return questions.map(normalizeQuestion);
}
