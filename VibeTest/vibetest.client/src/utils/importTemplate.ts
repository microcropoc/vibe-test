import type { TestDefinition } from '@/types';

export const DEFAULT_IMPORT_TEST_TEMPLATE: TestDefinition = {
  name: 'Новый тест',
  description: 'Описание теста',
  questions: [
    {
      text: 'Новый вопрос',
      answers: [
        { text: 'Неправильный ответ', isCorrect: false },
        { text: 'Правильный ответ', isCorrect: true },
        { text: 'Неправильный ответ', isCorrect: false },
      ],
    },
  ],
};

export function formatImportTestTemplate(): string {
  return JSON.stringify(DEFAULT_IMPORT_TEST_TEMPLATE, null, 2);
}
