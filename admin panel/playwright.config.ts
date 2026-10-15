import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: process.env.ADMIN_BASE_URL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: false,
    testIdAttribute: 'data-testid',
    storageState: process.env.ADMIN_STORAGE_STATE || undefined
  },
  outputDir: 'test-results/artifacts',
  projects: [
    { name: 'chrome-web', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge-web', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox-web', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari-web-compatibility', use: { ...devices['Desktop Safari'] } },
    { name: 'chrome-mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'edge-mobile-compatibility', use: { ...devices['Pixel 7'], channel: 'msedge' } },
    { name: 'firefox-mobile-compatibility', use: { ...devices['Desktop Firefox'], viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true } },
    { name: 'safari-mobile-compatibility', use: { ...devices['iPhone 15'] } }
  ]
});
