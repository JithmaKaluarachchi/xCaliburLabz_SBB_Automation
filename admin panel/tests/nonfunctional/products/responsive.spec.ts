import { test, expect } from '../../../fixtures/products.fixture';

test('PROD-NF-RESP-001 products fits configured web or mobile viewport @products @nonfunctional @responsive', async ({ page, products }) => {
  await products.open();
  await expect(products.search).toBeVisible();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
