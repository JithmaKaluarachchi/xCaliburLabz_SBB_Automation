import { test, expect } from '../../../fixtures/test.fixture';

test('@contact-us @nonfunctional @quality has no page errors or failed same-origin requests', async ({ page }) => {
  const errors: string[] = []; const failed: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => {
    const reason = request.failure()?.errorText ?? '';
    if (request.url().startsWith('https://sbb.caliburlabz.com') && reason !== 'net::ERR_ABORTED') failed.push(`${reason} ${request.url()}`);
  });
  await page.goto('/contact', { waitUntil: 'load' }); await page.waitForTimeout(500);
  expect(errors).toEqual([]); expect(failed).toEqual([]);
});
