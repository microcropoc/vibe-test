import type { GuestTestResult, LocalTest, TestDefinition, TestProgress } from '@/types';

const KEYS = {
  localTests: 'vibetest_local_tests',
  guestResults: 'vibetest_guest_results',
  progress: (id: string) => `vibetest_progress_${id}`,
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalTests(): LocalTest[] {
  return readJson<LocalTest[]>(KEYS.localTests, []);
}

export function saveLocalTest(test: LocalTest): void {
  const tests = getLocalTests();
  const index = tests.findIndex((t) => t.id === test.id);
  if (index >= 0) {
    tests[index] = test;
  } else {
    tests.push(test);
  }
  writeJson(KEYS.localTests, tests);
}

export function deleteLocalTest(id: string): void {
  writeJson(
    KEYS.localTests,
    getLocalTests().filter((t) => t.id !== id),
  );
  localStorage.removeItem(KEYS.progress(id));
}

export function getTestProgress(testId: string): TestProgress | null {
  return readJson<TestProgress | null>(KEYS.progress(testId), null);
}

export function saveTestProgress(testId: string, progress: TestProgress): void {
  writeJson(KEYS.progress(testId), progress);
}

export function getGuestResults(): GuestTestResult[] {
  return readJson<GuestTestResult[]>(KEYS.guestResults, []);
}

export function saveGuestResult(result: GuestTestResult): void {
  const results = getGuestResults().filter((r) => r.testId !== result.testId);
  results.push(result);
  writeJson(KEYS.guestResults, results);
}

export function createLocalTestFromDefinition(definition: TestDefinition): LocalTest {
  const now = new Date().toISOString();
  return {
    ...definition,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}
