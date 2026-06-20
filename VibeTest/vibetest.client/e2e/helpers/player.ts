import { expect, type Page } from '@playwright/test';

export async function answerQuestion(page: Page, answerText: string): Promise<void> {
  await page.locator('label.vt-option', { hasText: answerText }).click();
  const next = page.getByRole('button', { name: /Далее|Итог/ });
  await expect(next).toBeEnabled();
  await next.click();
}
