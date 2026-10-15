import { test, expect } from '../../../fixtures/brands.fixture';

test('BRAND-NF-RESP-001 brands fits configured web or mobile viewport @brands @nonfunctional @responsive', async ({ page, brands }) => {
  await brands.open();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
