import { test, expect } from '../../../fixtures/categories.fixture';

test('CAT-NF-QUAL-001 categories loads without uncaught page errors @categories @nonfunctional @quality', async ({ page, categories }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await categories.open();
  await categories.openNewModal();
  await page.keyboard.press('Escape');
  await testInfo.attach('categories-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
