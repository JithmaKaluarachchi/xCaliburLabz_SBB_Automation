import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ShopPage extends BasePage {
  readonly search: Locator;
  readonly searchButton: Locator;
  readonly sortButton: Locator;
  readonly productCards: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.search = page.getByRole('searchbox');
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.sortButton = page.locator('main button').filter({ hasText: /Newest|Price|Name/ }).first();
    this.productCards = page.locator('main a[href^="/shop/"]:has(img)');
    this.cartLink = page.locator('header a[href="/cart"]');
  }

  async open(): Promise<void> {
    await this.goto('/shop');
    await expect(this.page.getByRole('heading', { name: 'Shop', exact: true })).toBeVisible();
    await expect(this.productCards.first()).toBeVisible({ timeout: 20_000 });
  }

  async addFirstProduct(): Promise<{ name: string; price: number; href: string }> {
    const card = this.productCards.first().locator('..');
    const text = await card.innerText();
    const name = (await this.productCards.first().locator('img').getAttribute('alt'))!;
    const href = (await this.productCards.first().getAttribute('href'))!;
    const price = Number(text.match(/LKR\s*([\d,]+\.\d{2})/)?.[1].replace(/,/g, ''));
    await card.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(this.cartLink).toHaveAttribute('aria-label', /Cart, 1 item/);
    return { name, price, href };
  }
}
