import { test, expect } from '../../fixtures/test.fixture';
import { ShopPage } from '../../pages/shop.page';

async function stabilize(page: import('@playwright/test').Page) {
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await dialog.getByRole('button', { name: 'Close' }).click();
  }
  const images = page.locator('img');
  await images.evaluateAll(items => items.forEach(item => item.scrollIntoView({ block: 'center' })));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

test('@shop @visual shop listing visual regression', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'load' }); await stabilize(page);
  await expect(page).toHaveScreenshot('shop-listing.png', { fullPage: true, animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02, timeout: 20_000 });
});

test('@shop @visual populated cart visual regression', async ({ page }) => {
  const shop = new ShopPage(page); await shop.open(); await shop.addFirstProduct(); await shop.cartLink.click(); await stabilize(page);
  await expect(page).toHaveScreenshot('cart-populated.png', { fullPage: true, animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02, timeout: 20_000 });
});

test('@shop @visual populated checkout visual regression', async ({ page }) => {
  const shop = new ShopPage(page); await shop.open(); await shop.addFirstProduct(); await shop.cartLink.click();
  await page.getByRole('link', { name: /Proceed to checkout/i }).click(); await stabilize(page);
  await expect(page).toHaveScreenshot('checkout-populated.png', { fullPage: true, animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.02, timeout: 20_000 });
});
