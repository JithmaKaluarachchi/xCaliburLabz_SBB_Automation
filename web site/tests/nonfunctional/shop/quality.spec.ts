import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @quality shop has no uncaught errors or failed same-origin requests', async ({ page }) => {
  const errors: string[] = []; const failed: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText ?? '';
    if (new URL(request.url()).origin === new URL(page.url()).origin && reason !== 'net::ERR_ABORTED') failed.push(`${reason} ${request.url()}`);
  });
  await page.goto('/shop', { waitUntil: 'load' }); await page.waitForTimeout(1_000);
  expect(errors).toEqual([]); expect(failed).toEqual([]);
});
