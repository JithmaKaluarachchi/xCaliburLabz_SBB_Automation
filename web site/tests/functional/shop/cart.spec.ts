import { test, expect } from '../../../fixtures/test.fixture';
import { ShopPage } from '../../../pages/shop.page';

const money = (text: string) => Number(text.replace(/[^\d.]/g, ''));

test.describe('Shopping cart', () => {
  test('@shop @cart preserves selected item, quantity, totals, checkout and removal', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.open();
    const product = await shop.addFirstProduct();
    await shop.cartLink.click();
    await expect(page).toHaveURL(/\/cart\/?$/);
    await expect(page.getByRole('heading', { name: /Your Cart/i })).toBeVisible();
    await expect(page.getByText(product.name, { exact: true })).toBeVisible();
    await expect(page.locator('main')).toContainText('Review the items in your cart');

    const increase = page.getByRole('button', { name: 'Increase quantity' });
    const decrease = page.getByRole('button', { name: 'Decrease quantity' });
    await increase.click();
    await expect(page.locator('main')).toContainText(/Subtotal \(2 items\)/);
    await decrease.click();
    await expect(page.locator('main')).toContainText(/Subtotal \(1 item\)/);

    const mainText = await page.locator('main').innerText();
    const subtotal = mainText.match(/Subtotal \(1 item\)\s*LKR\s*([\d,]+\.\d{2})/i)?.[1];
    const estimated = mainText.match(/Estimated total\s*LKR\s*([\d,]+\.\d{2})/i)?.[1];
    expect(money(subtotal!)).toBe(product.price);
    expect(money(estimated!)).toBe(product.price);

    await expect(page.getByRole('link', { name: /Continue shopping/i })).toHaveAttribute('href', '/shop');
    await expect(page.getByRole('link', { name: /Proceed to checkout/i })).toHaveAttribute('href', '/checkout');
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.getByText(product.name, { exact: true })).toHaveCount(0);
  });

  test('@shop @cart Continue Shopping returns to shop', async ({ page }) => {
    const shop = new ShopPage(page); await shop.open(); await shop.addFirstProduct(); await shop.cartLink.click();
    await page.getByRole('link', { name: /Continue shopping/i }).click();
    await expect(page).toHaveURL(/\/shop\/?$/);
  });
});
