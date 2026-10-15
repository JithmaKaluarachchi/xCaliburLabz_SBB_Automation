import { test, expect } from '../../../fixtures/test.fixture';

test('@contact-us @nonfunctional @responsive has no horizontal overflow', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
});
