import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @seo shop has useful title, description, canonical and one visible primary heading', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' }); await expect(page).toHaveTitle(/Shop|SBB Oxygen/i);
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/shop\/?$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Shop', exact: true })).toBeVisible();
});
