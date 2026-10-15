import { test, expect } from '../../../fixtures/test.fixture';
import { services } from '../../functional/services/service-data';

for (const service of services) test(`@services @nonfunctional @performance ${service.name} meets navigation budgets`, async ({ page }, testInfo) => {
  await page.goto(service.path, { waitUntil: 'load' });
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return { domContentLoaded: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), transferSize: nav.transferSize };
  });
  await testInfo.attach('navigation-timing', { body: JSON.stringify(timing, null, 2), contentType: 'application/json' });
  expect(timing.domContentLoaded).toBeLessThan(Number(process.env.MAX_DOM_CONTENT_LOADED_MS ?? 5000));
  expect(timing.load).toBeLessThan(Number(process.env.MAX_PAGE_LOAD_MS ?? 8000));
});
