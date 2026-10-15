import { test, expect } from '../../../fixtures/test.fixture';

test('@contact-us @nonfunctional @map embedded maps use HTTPS, have titles and load safely', async ({ page }) => {
  await page.goto('/contact', { waitUntil: 'load' }); const frame = page.locator('iframe');
  await expect(frame).toBeVisible(); await expect(frame).toHaveAttribute('title', /SBB Oxygen House - .+ Branch/);
  await expect(frame).toHaveAttribute('src', /^https:\/\/maps\.google\.com\/maps\?q=.+&output=embed$/);
});
