import { expect, test } from '@playwright/test';
import { fillMinimalTest, saveNewTest } from '../helpers/editor';
import { answerQuestion } from '../helpers/player';

function uniqueEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`;
}

async function registerUser(
  page: import('@playwright/test').Page,
  email: string,
  displayName = 'E2E User',
): Promise<void> {
  await page.goto('/register');
  await page.getByLabel('Имя').fill(displayName);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page).toHaveURL('/');
}

async function loginUser(page: import('@playwright/test').Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Войти' }).click();
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

test('создание link-заявки и прохождение по ссылке', async ({ page }) => {
  const email = uniqueEmail();
  const testName = `Application Link E2E ${Date.now()}`;
  const applicationTitle = `Link Application ${Date.now()}`;

  await registerUser(page, email);

  await page.goto('/editor');
  await fillMinimalTest(page, testName);
  await saveNewTest(page);

  await page.getByRole('link', { name: 'Заявки' }).click();
  await page.getByLabel('Название заявки').fill(applicationTitle);
  await page.getByLabel('Тест').selectOption({ label: testName });
  await page.getByRole('button', { name: 'Создать' }).click();

  await expect(page.getByText(`Ссылка для ${applicationTitle}`)).toBeVisible();
  const playUrl = await page.locator('code').last().innerText();

  await page.goto(playUrl);
  await answerQuestion(page, 'Париж');

  await expect(page.getByRole('heading', { name: 'Результат' })).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
});

test('internal-заявка отображается во входящих и проходится получателем', async ({ page }) => {
  const recipientEmail = uniqueEmail();
  const authorEmail = uniqueEmail();
  const recipientName = `Recipient ${Date.now()}`;
  const testName = `Internal Application E2E ${Date.now()}`;
  const applicationTitle = `Internal Application ${Date.now()}`;

  await registerUser(page, recipientEmail, recipientName);
  await page.getByRole('button', { name: 'Выйти' }).click();

  await registerUser(page, authorEmail, 'Application Author');
  await page.goto('/editor');
  await fillMinimalTest(page, testName);
  await saveNewTest(page);

  await page.getByRole('link', { name: 'Заявки' }).click();
  await page.getByLabel('Название заявки').fill(applicationTitle);
  await page.getByLabel('Для внутреннего пользователя').check();
  await page.getByRole('button', { name: 'Выбрать пользователя' }).click();
  await page.getByLabel('Поиск по имени или email').fill(recipientName);
  const recipientRow = page.locator('.full-list__item', { hasText: recipientName });
  await recipientRow.getByRole('button', { name: 'Выбрать' }).click();
  await page.getByLabel('Тест').selectOption({ label: testName });
  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page.getByText(`Заявка ${applicationTitle}`)).toBeVisible();

  await page.getByRole('button', { name: 'Выйти' }).click();
  await loginUser(page, recipientEmail);
  await page.goto('/applications?tab=incoming');
  const incomingRow = page.locator('.full-list__item', { hasText: applicationTitle });
  await expect(incomingRow).toBeVisible();
  await incomingRow.getByRole('link', { name: 'Пройти' }).click();
  await answerQuestion(page, 'Париж');

  await expect(page.getByRole('heading', { name: 'Результат' })).toBeVisible();
  await expect(page.getByText('100%')).toBeVisible();
});
