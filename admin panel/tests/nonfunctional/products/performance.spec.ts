import { test, expect } from '../../../fixtures/products.fixture';

test('PROD-NF-PERF-001 products reaches DOM ready within ten seconds @products @nonfunctional @performance', async ({ page, products }, testInfo) => {
  const started = Date.now();
  await products.open();
  const elapsed = Date.now() - started;
  await testInfo.attach('products-load-time.txt', { body: `${elapsed} ms`, contentType: 'text/plain' });
  expect(elapsed).toBeLessThan(10_000);
  const timing = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON?.() ?? {});
  await testInfo.attach('products-navigation-timing.json', { body: JSON.stringify(timing, null, 2), contentType: 'application/json' });
});
