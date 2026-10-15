import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @keyboard shop controls are keyboard reachable', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' }); await expect(page.getByRole('searchbox')).toBeVisible();
  let reachedSearch = false;
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Tab');
    if (await page.getByRole('searchbox').evaluate(el => el === document.activeElement)) { reachedSearch = true; break; }
  }
  expect(reachedSearch, 'Search should be reachable using Tab').toBeTruthy();
});
