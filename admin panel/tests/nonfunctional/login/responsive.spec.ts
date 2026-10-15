import { test, expect } from '../../../fixtures/login.fixture';

test('LOGIN-NF-RESP-001 layout fits the configured web or mobile viewport @nonfunctional @responsive', async ({ page, loginPage }) => {
  await loginPage.open();
  const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(metrics.content, `Horizontal overflow: content ${metrics.content}px, viewport ${metrics.viewport}px`).toBeLessThanOrEqual(metrics.viewport + 1);
  await expect(loginPage.email).toBeInViewport();
  await expect(loginPage.password).toBeInViewport();
  await expect(loginPage.submit).toBeInViewport();
});
