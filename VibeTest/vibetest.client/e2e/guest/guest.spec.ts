import { expect, test } from '@playwright/test';
import { fillMinimalTest, saveNewTest } from '../helpers/editor';
import { answerQuestion } from '../helpers/player';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('главная страница и навигация', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Конструктор тестов' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Гостевой режим' }).getByRole('link', { name: 'Редактор' }).click();
  await expect(page.getByRole('heading', { name: 'Новый тест' })).toBeVisible();
});

test('создание, прохождение и результат локального теста', async ({ page }) => {
  const testName = `Guest E2E ${Date.now()}`;

  await page.goto('/editor');
  await fillMinimalTest(page, testName);
  await saveNewTest(page);

  await expect(page.getByRole('heading', { name: 'Мои тесты' })).toBeVisible();
  await expect(page.locator('.guest-list__title', { hasText: testName })).toBeVisible();

  await page.locator(`a[href*="/play/"]`).first().click();
  await expect(page).toHaveURL(/\/play\//);

  await answerQuestion(page, 'Париж');

  await expect(page.getByRole('heading', { name: 'Результат' })).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
});

test('импорт JSON из буфера', async ({ page }) => {
  const json = JSON.stringify({
    name: 'Imported Guest Test',
    questions: [
      {
        text: 'Цвет неба?',
        answers: ['Голубой', 'Зелёный'],
        correct: 0,
      },
    ],
  });

  await page.goto('/import');
  await page.locator('.guest-textarea').fill(json);
  await expect(page.locator('.guest-textarea')).toHaveValue(json);
  await page.getByRole('button', { name: 'Импортировать' }).click();
  await expect(page.getByText('Тест «Imported Guest Test» сохранён локально.')).toBeVisible();
  await expect(page).toHaveURL(/\/tests$/, { timeout: 10_000 });
  await expect(page.locator('.guest-list__title', { hasText: 'Imported Guest Test' })).toBeVisible();
});
