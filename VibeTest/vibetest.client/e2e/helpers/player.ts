import type { Page } from '@playwright/test';

export async function answerQuestion(page: Page, answerText: string): Promise<void> {
  await page.locator('label.vt-option', { hasText: answerText }).click();
  await page.getByRole('button', { name: /Далее|Итог/ }).waitFor({ state: 'visible' });
}

export async function goNextOrFinish(page: Page): Promise<void> {
  const next = page.getByRole('button', { name: /Далее|Итог/ });
  await next.click();
}
