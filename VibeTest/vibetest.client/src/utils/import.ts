import type { QuestionDefinition, TestDefinition } from '@/types';
import { parseDifficulty } from '@/utils/testDifficulty';

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

function parseQuestion(q: unknown, qi: number): QuestionDefinition {
  if (!q || typeof q !== 'object') {
    throw new ImportValidationError(`Вопрос ${qi + 1}: неверный формат`);
  }
  const question = q as Record<string, unknown>;
  if (typeof question.text !== 'string' || question.text.trim() === '') {
    throw new ImportValidationError(`Вопрос ${qi + 1}: text обязателен`);
  }
  if (!Array.isArray(question.answers) || question.answers.length < 2) {
    throw new ImportValidationError(`Вопрос ${qi + 1}: минимум 2 ответа`);
  }

  const answers = question.answers.map((a, ai) => {
    if (typeof a !== 'string' || a.trim() === '') {
      throw new ImportValidationError(`Вопрос ${qi + 1}, ответ ${ai + 1}: текст обязателен`);
    }
    return a;
  });

  if (typeof question.correct !== 'number' || !Number.isInteger(question.correct)) {
    throw new ImportValidationError(`Вопрос ${qi + 1}: correct должен быть целым числом`);
  }
  if (question.correct < 0 || question.correct >= answers.length) {
    throw new ImportValidationError(`Вопрос ${qi + 1}: correct вне диапазона ответов`);
  }

  const result: QuestionDefinition = { text: question.text, answers, correct: question.correct };
  if (typeof question.explanation === 'string' && question.explanation.trim() !== '') {
    result.explanation = question.explanation.trim();
  }
  return result;
}

export function parseQuestionsJson(raw: string): QuestionDefinition[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new ImportValidationError('Некорректный JSON');
  }

  if (!data || typeof data !== 'object') {
    throw new ImportValidationError('Ожидается объект');
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    throw new ImportValidationError('Нужен минимум один вопрос');
  }

  return obj.questions.map((q, qi) => parseQuestion(q, qi));
}

export function parseTestJson(raw: string): TestDefinition {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new ImportValidationError('Некорректный JSON');
  }

  if (!data || typeof data !== 'object') {
    throw new ImportValidationError('Ожидается объект');
  }

  const test = data as Record<string, unknown>;

  if (typeof test.name !== 'string' || test.name.trim() === '') {
    throw new ImportValidationError('Поле name обязательно');
  }

  if (!Array.isArray(test.questions) || test.questions.length === 0) {
    throw new ImportValidationError('Нужен минимум один вопрос');
  }

  const questions = test.questions.map((q, qi) => parseQuestion(q, qi));
  const difficulty = parseDifficulty(test.difficulty);

  return {
    name: test.name.trim(),
    description: typeof test.description === 'string' ? test.description : undefined,
    ...(difficulty ? { difficulty } : {}),
    questions,
  };
}
