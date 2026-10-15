import { test, expect } from '../../../fixtures/brands.fixture';

test('BRAND-NF-PERF-001 brands reaches DOM ready within ten seconds @brands @nonfunctional @performance', async ({ page, brands }, testInfo) => {
  const started = Date.now();
  await brands.open();
  const elapsed = Date.now() - started;
  await testInfo.attach('brands-load-time.txt', { body: `${elapsed} ms`, contentType: 'text/plain' });
  expect(elapsed).toBeLessThan(10_000);
  const timing = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON?.() ?? {});
  await testInfo.attach('brands-navigation-timing.json', { body: JSON.stringify(timing, null, 2), contentType: 'application/json' });
});
