import type { GuestTestResult, LocalTest, TestDefinition, TestProgress } from '@/types';

const KEYS = {
  localTests: 'vibetest_local_tests',
  isInitLocalTests: 'vibetest_is_init_local_tests',
  guestResults: 'vibetest_guest_results',
  progress: (id: string) => `vibetest_progress_${id}`,
  apiProgress: (id: number) => `vibetest_progress_api_${id}`,
  applicationProgress: (token: string) => `vibetest_application_progress_${token}`,
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

export function notifyStorageChange(): void {
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('vibetest-storage'));
}

export function getLocalTestsSnapshot(): string {
  return localStorage.getItem(KEYS.localTests) ?? '[]';
}

export function setIsInitLocalTests(): void {
  writeJson<boolean>(KEYS.isInitLocalTests, true);
}

export function getIsInitLocalTests(): boolean {
  return readJson<boolean>(KEYS.isInitLocalTests, false);
}

export function getLocalTests(): LocalTest[] {
  return readJson<LocalTest[]>(KEYS.localTests, []);
}

export function getLocalTestById(id: string): LocalTest | undefined {
  return getLocalTests().find((t) => t.id === id);
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
  notifyStorageChange();
}

/** Replaces the entire local test list; does not merge with existing tests. */
export function saveLocalTestsBulk(tests: LocalTest[]): void {
  writeJson(KEYS.localTests, tests);
  notifyStorageChange();
}

export function deleteLocalTest(id: string): void {
  writeJson(
    KEYS.localTests,
    getLocalTests().filter((t) => t.id !== id),
  );
  localStorage.removeItem(KEYS.progress(id));
  notifyStorageChange();
}

export function getTestProgress(testId: string): TestProgress | null {
  return readJson<TestProgress | null>(KEYS.progress(testId), null);
}

export function saveTestProgress(testId: string, progress: TestProgress): void {
  writeJson(KEYS.progress(testId), progress);
}

export function clearTestProgress(testId: string): void {
  localStorage.removeItem(KEYS.progress(testId));
}

export function getApiTestProgress(testId: number): TestProgress | null {
  return readJson<TestProgress | null>(KEYS.apiProgress(testId), null);
}

export function saveApiTestProgress(testId: number, progress: TestProgress): void {
  writeJson(KEYS.apiProgress(testId), progress);
}

export function clearApiTestProgress(testId: number): void {
  localStorage.removeItem(KEYS.apiProgress(testId));
}

export function getApplicationProgress(token: string): TestProgress | null {
  return readJson<TestProgress | null>(KEYS.applicationProgress(token), null);
}

export function saveApplicationProgress(token: string, progress: TestProgress): void {
  writeJson(KEYS.applicationProgress(token), progress);
}

export function clearApplicationProgress(token: string): void {
  localStorage.removeItem(KEYS.applicationProgress(token));
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

export function updateLocalTestFromDefinition(id: string, definition: TestDefinition): LocalTest {
  const existing = getLocalTestById(id);
  const now = new Date().toISOString();
  return {
    ...definition,
    id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}
