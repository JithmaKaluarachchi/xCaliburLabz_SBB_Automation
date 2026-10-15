import { test, expect } from '../../../fixtures/test.fixture';

for (const path of ['/shop', '/cart', '/checkout']) {
  test(`@shop @nonfunctional @responsive ${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  });
}
