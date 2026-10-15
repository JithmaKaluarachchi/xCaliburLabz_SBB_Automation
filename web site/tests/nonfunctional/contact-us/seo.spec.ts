import { test, expect } from '../../../fixtures/test.fixture';

test('@contact-us @nonfunctional @seo has metadata and semantic structure', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'domcontentloaded' }); await expect(page).toHaveTitle(/Contact|SBB Oxygen/i);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/contact\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});
