import { test, expect } from '../../../fixtures/test.fixture';
import { ShopPage } from '../../../pages/shop.page';

test('@shop @product-detail validates product data, quantity, tabs, cart, and related products', async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.open();
  const href = (await shop.productCards.first().getAttribute('href'))!;
  const name = (await shop.productCards.first().locator('img').getAttribute('alt'))!;
  await page.goto(href, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('main img').filter({ has: page.locator(`[alt="${name}"]`) }).or(page.getByRole('img', { name })).first()).toBeVisible();
  await expect(page.locator('main')).toContainText(/LKR/);
  await expect(page.locator('main')).toContainText(/in stock|out of stock/i);

  const plus = page.getByRole('button', { name: /increase|plus/i }).first();
  const minus = page.getByRole('button', { name: /decrease|minus/i }).first();
  const quantity = page.locator('main input[type="number"]').first();
  if (await quantity.count()) {
    const before = Number(await quantity.inputValue());
    await plus.click();
    await expect(quantity).toHaveValue(String(before + 1));
    await minus.click();
    await expect(quantity).toHaveValue(String(before));
  }

  for (const tab of ['Description', 'Specifications', 'Reviews']) {
    const control = page.getByRole('tab', { name: new RegExp(tab, 'i') }).or(page.getByRole('button', { name: new RegExp(tab, 'i') })).first();
    await control.scrollIntoViewIfNeeded();
    await control.click();
    await expect(control).toBeVisible();
  }

  const related = page.getByText(/Related Products/i).first();
  await related.scrollIntoViewIfNeeded();
  await expect(related).toBeVisible();
  await expect(page.locator('main a[href^="/shop/"]:has(img)').first()).toBeVisible();

  await page.getByRole('button', { name: /Add to Cart/i }).first().click();
  await expect(page.locator('header a[href="/cart"]')).toHaveAttribute('aria-label', /[1-9]\d* item/);
});
