import type { TestDefinition } from '@/types';

export function exportTestToJson(test: TestDefinition): string {
  const payload: TestDefinition = {
    name: test.name,
    description: test.description,
    questions: test.questions.map((q) => ({
      text: q.text,
      answers: [...q.answers],
      correct: q.correct,
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
