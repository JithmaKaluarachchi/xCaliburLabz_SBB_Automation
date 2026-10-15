import { test, expect } from '../../../fixtures/brands.fixture';

test('BRAND-NF-QUAL-001 brands loads without uncaught page errors @brands @nonfunctional @quality', async ({ page, brands }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await brands.open();
  await brands.openNewModal();
  await page.keyboard.press('Escape');
  await testInfo.attach('brands-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
