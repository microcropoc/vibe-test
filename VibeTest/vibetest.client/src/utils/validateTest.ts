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
  const correctCount = question.answers.filter((a) => a.isCorrect).length;
  if (correctCount !== 1) {
    throw new ImportValidationError(`Вопрос ${index + 1}: ровно один правильный ответ`);
  }
  question.answers.forEach((a, ai) => {
    if (!a.text?.trim()) {
      throw new ImportValidationError(`Вопрос ${index + 1}, ответ ${ai + 1}: текст обязателен`);
    }
  });
}

export function createEmptyQuestion(): QuestionDefinition {
  return {
    text: '',
    answers: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
  };
}

export function createEmptyTest(): TestDefinition {
  return {
    name: '',
    description: '',
    questions: [createEmptyQuestion()],
  };
}
