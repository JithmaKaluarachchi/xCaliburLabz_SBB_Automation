import { test, expect } from '../../../fixtures/test.fixture';

test('@nonfunctional @performance meets configurable navigation timing budgets', async ({ homePage, page }, testInfo) => {
  await homePage.open();
  await page.waitForLoadState('load');

  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
      load: Math.round(navigation.loadEventEnd),
      transferSize: navigation.transferSize
    };
  });
  await testInfo.attach('navigation-timing', {
    body: JSON.stringify(timing, null, 2),
    contentType: 'application/json'
  });

  expect(timing.domContentLoaded).toBeLessThan(Number(process.env.MAX_DOM_CONTENT_LOADED_MS ?? 5000));
  expect(timing.load).toBeLessThan(Number(process.env.MAX_PAGE_LOAD_MS ?? 8000));
});
