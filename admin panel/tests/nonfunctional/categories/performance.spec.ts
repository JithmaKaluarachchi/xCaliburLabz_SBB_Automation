import { test, expect } from '../../../fixtures/categories.fixture';

test('CAT-NF-PERF-001 categories reaches DOM ready within ten seconds @categories @nonfunctional @performance', async ({ page, categories }, testInfo) => {
  const started = Date.now();
  await categories.open();
  const elapsed = Date.now() - started;
  await testInfo.attach('categories-load-time.txt', { body: `${elapsed} ms`, contentType: 'text/plain' });
  expect(elapsed).toBeLessThan(10_000);
  const timing = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON?.() ?? {});
  await testInfo.attach('categories-navigation-timing.json', { body: JSON.stringify(timing, null, 2), contentType: 'application/json' });
});
