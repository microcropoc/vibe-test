import type { TestDifficulty } from '@/types';
import { TEST_DIFFICULTY_LABELS } from '@/utils/testDifficulty';

export type AiPromptOptions = {
  topic: string;
  questionCount: number;
  answerCount: number;
  difficulty: TestDifficulty;
  includeExplanations: boolean;
};

export function buildAiTestPrompt(options: AiPromptOptions): string {
  const topic = options.topic.trim();
  const difficultyLabel = TEST_DIFFICULTY_LABELS[options.difficulty];
  const explanationRule = options.includeExplanations
    ? 'У каждого вопроса добавь поле explanation с кратким пояснением к правильному ответу.'
    : 'Поле explanation не добавляй.';

  return `Создай тест в формате JSON для приложения VibeTest.

Тема: ${topic}
Количество вопросов: ${options.questionCount}
Вариантов ответа на каждый вопрос: ${options.answerCount}
Сложность: ${difficultyLabel} (поле difficulty: "${options.difficulty}")
Язык: русский — name, description, text вопросов, варианты answers${options.includeExplanations ? ' и explanation' : ''} должны быть на русском языке.

${explanationRule}

Требования к формату:
- Корневой объект: name (строка), description (строка, опционально), difficulty ("easy" | "medium" | "hard"), questions (массив)
- name и description должны соответствовать теме теста
- Каждый вопрос: text (строка), answers (массив строк), correct (целое число — индекс правильного ответа, с нуля)
- В каждом вопросе ровно ${options.answerCount} варианта ответа
- Ровно ${options.questionCount} вопросов в массиве questions
- correct должен указывать на существующий индекс в answers

Верни только валидный JSON без markdown-обёртки, комментариев и пояснений вне JSON.`;
}
