import type { TestDefinition } from '@/types';
import { normalizeDifficulty } from '@/utils/testDifficulty';

export function exportTestToJson(test: TestDefinition): string {
  const payload: TestDefinition = {
    name: test.name,
    description: test.description,
    difficulty: normalizeDifficulty(test.difficulty),
    questions: test.questions.map((q) => ({
      text: q.text,
      answers: [...q.answers],
      correct: q.correct,
      ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadTestJson(test: TestDefinition, filename?: string): void {
  const blob = new Blob([exportTestToJson(test)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename ?? `${test.name || 'test'}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
