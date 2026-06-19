import { expect, test } from '@playwright/test';
import { fillMinimalTest, saveNewTest } from '../helpers/editor';
import { answerQuestion } from '../helpers/player';

function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}

async function registerUser(page: import('@playwright/test').Page, email: string): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Имя').fill('E2E User');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page).toHaveURL('/');
}

test('регистрация и вход', async ({ page }) => {
  const email = uniqueEmail();
  await registerUser(page, email);

  await page.getByRole('button', { name: 'Выйти' }).click();
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByText('E2E User')).toBeVisible();
});

test('создание, публикация и прохождение облачного теста', async ({ page }) => {
  const email = uniqueEmail();
  const testName = `Full E2E ${Date.now()}`;

  await registerUser(page, email);

  await page.goto('/editor');
  await fillMinimalTest(page, testName);
  await saveNewTest(page);
  await expect(page).toHaveURL(/\/my\/tests$/);

  const testRow = page.locator('.full-list__item', { hasText: testName });
  await testRow.getByRole('button', { name: 'Опубликовать' }).click();
  await page.getByRole('link', { name: 'Публичные тесты' }).click();
  await expect(page.getByRole('link', { name: testName })).toBeVisible();

  await page.getByRole('link', { name: testName }).click();
  await page.getByRole('link', { name: 'Пройти тест' }).click();

  await answerQuestion(page, 'Париж');

  await expect(page.getByRole('heading', { name: 'Результат' })).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
});

test('профиль показывает статистику после прохождения', async ({ page }) => {
  const email = uniqueEmail();
  const testName = `Profile E2E ${Date.now()}`;

  await registerUser(page, email);

  await page.goto('/editor');
  await fillMinimalTest(page, testName);
  await saveNewTest(page);

  const testRow = page.locator('.full-list__item', { hasText: testName });
  await testRow.getByRole('button', { name: 'Опубликовать' }).click();

  await page.getByRole('link', { name: 'Публичные тесты' }).click();
  await page.getByRole('link', { name: testName }).click();
  await page.getByRole('link', { name: 'Пройти тест' }).click();

  await answerQuestion(page, 'Париж');
  await expect(page.getByRole('heading', { name: 'Результат' })).toBeVisible();

  await page.getByRole('link', { name: 'Профиль' }).click();
  await expect(page.locator('.full-stat', { hasText: 'Пройдено' }).locator('.full-stat__value')).toHaveText('1');
  await expect(page.getByRole('link', { name: testName })).toBeVisible();
});
