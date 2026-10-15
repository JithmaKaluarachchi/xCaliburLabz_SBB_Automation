import { test, expect } from '../../../fixtures/categories.fixture';

test('CAT-NF-RESP-001 categories fits configured web or mobile viewport @categories @nonfunctional @responsive', async ({ page, categories }) => {
  await categories.open();
  const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
