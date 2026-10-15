import { test, expect } from '../../../fixtures/orders.fixture';

test('ORDER-NF-RESP-001 list and details avoid viewport overflow @orders @nonfunctional @responsive', async ({ page, orders }) => {
  await orders.open();
  let size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(size.content).toBeLessThanOrEqual(size.viewport + 1);
  await orders.openFirstDetails();
  size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(size.content).toBeLessThanOrEqual(size.viewport + 1);
});
