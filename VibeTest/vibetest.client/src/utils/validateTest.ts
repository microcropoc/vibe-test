import type { QuestionDefinition, TestDefinition } from '@/types';
import { ImportValidationError } from '@/utils/import';

export function validateTestDefinition(definition: TestDefinition): void {
  if (!definition.name?.trim()) {
    throw new ImportValidationError('Название теста обязательно');
  }
  if (!definition.questions?.length) {
    throw new ImportValidationError('Нужен минимум один вопрос');
  }

  definition.questions.forEach((q, qi) => validateQuestion(q, qi));
}

function validateQuestion(question: QuestionDefinition, index: number): void {
  if (!question.text?.trim()) {
    throw new ImportValidationError(`Вопрос ${index + 1}: текст обязателен`);
  }
  if (!question.answers || question.answers.length < 2) {
    throw new ImportValidationError(`Вопрос ${index + 1}: минимум 2 ответа`);
  }
  if (
    !Number.isInteger(question.correct) ||
    question.correct < 0 ||
    question.correct >= question.answers.length
  ) {
    throw new ImportValidationError(`Вопрос ${index + 1}: неверный индекс correct`);
  }
  question.answers.forEach((text, ai) => {
    if (!text?.trim()) {
      throw new ImportValidationError(`Вопрос ${index + 1}, ответ ${ai + 1}: текст обязателен`);
    }
  });
}

export function createEmptyQuestion(): QuestionDefinition {
  return {
    text: '',
    answers: ['', ''],
    correct: 0,
  };
}

export function createEmptyTest(): TestDefinition {
  return {
    name: '',
    description: '',
    difficulty: 'easy',
    questions: [createEmptyQuestion()],
  };
}
