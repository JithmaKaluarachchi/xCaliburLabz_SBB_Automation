import { test, expect } from '../../../fixtures/dashboard.fixture';

test('DASH-NF-RESP-001 dashboard fits the configured web or mobile viewport @dashboard @nonfunctional @responsive', async ({ page, dashboard }) => {
  await dashboard.open();
  await dashboard.recentPayments.scrollIntoViewIfNeeded();
  await expect(dashboard.recentPayments).toBeVisible();
  const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(metrics.content).toBeLessThanOrEqual(metrics.viewport + 1);
});
