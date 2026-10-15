import { test, expect } from '../../../fixtures/dashboard.fixture';

test('DASH-NF-PERF-001 dashboard reaches DOM ready within ten seconds @dashboard @nonfunctional @performance', async ({ page, dashboard }, testInfo) => {
  const started = Date.now();
  await dashboard.open();
  const elapsed = Date.now() - started;
  await testInfo.attach('dashboard-load-time.txt', { body: `${elapsed} ms`, contentType: 'text/plain' });
  expect(elapsed).toBeLessThan(10_000);
  const timing = await page.evaluate(() => performance.getEntriesByType('navigation')[0]?.toJSON?.() ?? {});
  await testInfo.attach('dashboard-navigation-timing.json', { body: JSON.stringify(timing, null, 2), contentType: 'application/json' });
});
