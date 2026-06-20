import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export async function fillMinimalTest(page: Page, name: string): Promise<void> {
  await page.locator('#test-name').fill(name);
  await page.locator('.vt-card textarea').first().fill('Столица Франции?');
  await page.getByPlaceholder('Ответ 1').fill('Париж');
  await page.getByPlaceholder('Ответ 2').fill('Лондон');
  await expect(page.locator('#test-name')).toHaveValue(name);
}

export async function saveNewTest(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Предпросмотр' }).click();
  await expect(page.getByRole('heading', { name: 'Предпросмотр' })).toBeVisible();
  await page.getByRole('button', { name: 'Сохранить' }).click();
}

export async function saveExistingTest(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Сохранить' }).click();
}

export async function appendQuestionsFromJson(page: Page, json: string): Promise<void> {
  await page.locator('details.vt-import-panel summary').click();
  await page.locator('#import-json').fill(json);
  await page.getByRole('button', { name: 'Добавить вопросы' }).click();
}
