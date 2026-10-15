import { test, expect } from '../../../fixtures/products.fixture';

test('PROD-NF-QUAL-001 products loads without uncaught page errors @products @nonfunctional @quality', async ({ page, products }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await products.open();
  await products.filter('status').click();
  await page.keyboard.press('Escape');
  await testInfo.attach('products-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
