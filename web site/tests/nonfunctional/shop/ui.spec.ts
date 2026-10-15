import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @ui shop cards and controls have accessible names and usable dimensions', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  const cards = page.locator('main a[href^="/shop/"]:has(img)'); await expect(cards.first()).toBeVisible({ timeout: 20_000 });
  expect(await cards.count()).toBeGreaterThan(0);
  for (let i = 0; i < await cards.count(); i++) {
    const box = await cards.nth(i).boundingBox(); expect(box?.width ?? 0).toBeGreaterThan(100); expect(box?.height ?? 0).toBeGreaterThan(100);
    await expect(cards.nth(i).locator('img')).toHaveAttribute('alt', /\S+/);
  }
  await expect(page.getByRole('searchbox')).toHaveAttribute('placeholder', /Search/i);
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
});
