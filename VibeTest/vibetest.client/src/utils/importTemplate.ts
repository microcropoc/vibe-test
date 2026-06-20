import type { TestDefinition } from '@/types';

export const DEFAULT_IMPORT_TEST_TEMPLATE: TestDefinition = {
  name: 'Новый тест',
  description: 'Описание теста',
  questions: [
    {
      text: 'Новый вопрос',
      answers: ['Неправильный ответ', 'Правильный ответ', 'Неправильный ответ'],
      correct: 1,
    },
  ],
};

export function formatImportTestTemplate(): string {
  return JSON.stringify(DEFAULT_IMPORT_TEST_TEMPLATE, null, 2);
}
