import { defineConfig, devices } from '@playwright/test';

const guestPort = 4173;

export default defineConfig({
  testDir: './e2e/guest',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://localhost:${guestPort}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run build:e2e-guest && npx vite preview --mode e2e-guest --port ${guestPort} --host`,
    url: `http://localhost:${guestPort}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
