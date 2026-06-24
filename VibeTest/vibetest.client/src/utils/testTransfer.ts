import { testsApi } from '@/full/api';
import type { LocalTest, TestDefinition } from '@/types';
import type { TestFullResponse } from '@/types/api';
import { downloadTestJson } from '@/utils/export';
import { normalizeQuestions } from '@/utils/normalizeQuestions';
import { createLocalTestFromDefinition, getLocalTestById, saveLocalTest } from '@/utils/storage';

export function apiFullToDefinition(full: TestFullResponse): TestDefinition {
  return {
    name: full.name,
    description: full.description,
    questions: full.questions.map((q) => ({
      text: q.text,
      answers: [...q.answers],
      correct: q.correct,
    })),
  };
}

export function saveCloudTestLocally(full: TestFullResponse): LocalTest {
  const local = createLocalTestFromDefinition(apiFullToDefinition(full));
  saveLocalTest(local);
  return local;
}

export function downloadCloudTestJson(full: TestFullResponse): void {
  downloadTestJson(apiFullToDefinition(full));
}

export async function uploadLocalTestToCloud(testId: string): Promise<number> {
  const test = getLocalTestById(testId);
  if (!test) {
    throw new Error('Тест не найден');
  }

  const payload: TestDefinition = {
    name: test.name,
    description: test.description,
    questions: normalizeQuestions(test.questions),
  };

  const created = await testsApi.create(payload);
  return created.id;
}
