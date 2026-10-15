import { test, expect } from '../../../fixtures/login.fixture';

test('LOGIN-NF-PERF-001 login page reaches DOM ready within 5 seconds @nonfunctional @performance', async ({ page }) => {
  const started = Date.now();
  const response = await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - started;
  expect(response?.ok()).toBeTruthy();
  expect(elapsed, `DOM-ready time was ${elapsed} ms`).toBeLessThan(5_000);
});
