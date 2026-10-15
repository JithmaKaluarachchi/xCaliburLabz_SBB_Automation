import { test, expect } from '../../../fixtures/test.fixture';

test('@about-us @nonfunctional @seo has metadata and semantic structure', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded' }); await expect(page).toHaveTitle(/About Us|SBB Oxygen/i);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/about\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});
