import type { TestDefinition } from '@/types';

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
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

  const questions = test.questions.map((q, qi) => {
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
      if (!a || typeof a !== 'object') {
        throw new ImportValidationError(`Вопрос ${qi + 1}, ответ ${ai + 1}: неверный формат`);
      }
      const answer = a as Record<string, unknown>;
      if (typeof answer.text !== 'string' || answer.text.trim() === '') {
        throw new ImportValidationError(`Вопрос ${qi + 1}, ответ ${ai + 1}: text обязателен`);
      }
      return { text: answer.text, isCorrect: Boolean(answer.isCorrect) };
    });

    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      throw new ImportValidationError(`Вопрос ${qi + 1}: ровно один правильный ответ`);
    }

    return { text: question.text, answers };
  });

  return {
    name: test.name.trim(),
    description: typeof test.description === 'string' ? test.description : undefined,
    questions,
  };
}
