const { chromium } = require('playwright');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ quiet: true });

(async () => {
  if (!process.env.ADMIN_BASE_URL || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)
    throw new Error('ADMIN_BASE_URL, ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
  const output = path.resolve('test-results/auth/admin.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ baseURL: process.env.ADMIN_BASE_URL });
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const form = document.querySelector('form');
    return Boolean(form && Object.keys(form).some(key => key.startsWith('__reactProps$')));
  }, undefined, { timeout: 15000 });
  await page.getByLabel('Email', { exact: true }).fill(process.env.ADMIN_USERNAME);
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL(`${process.env.ADMIN_BASE_URL}/admin`, { timeout: 20000 });
  await page.context().storageState({ path: output });
  await browser.close();
  console.log('Authenticated admin session state created.');
})().catch((error) => { console.error(error.message); process.exit(1); });
