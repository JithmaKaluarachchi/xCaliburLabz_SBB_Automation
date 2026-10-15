import { test, expect } from '../../../fixtures/login.fixture';

test('LOGIN-NF-QUAL-001 loads without uncaught page errors @nonfunctional @quality', async ({ page, loginPage }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await loginPage.open();
  await page.waitForTimeout(1_000);
  await testInfo.attach('page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
