import { expect, Locator, Page } from '@playwright/test';

export const productTableHeaders = ['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'] as const;
export const productStatuses = ['Active', 'Draft', 'Archived'] as const;

export class ProductsPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly main: Locator;
  readonly search: Locator;
  readonly newProduct: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Products', exact: true });
    this.description = page.getByText('Your catalog of oxygen & healthcare equipment.', { exact: true });
    this.main = page.locator('main');
    this.search = page.getByPlaceholder('Search name or SKU');
    this.newProduct = page.getByRole('link', { name: /new product/i });
  }

  async open() {
    const response = await this.page.goto('/admin/products', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Products returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
  }

  filter(name: 'status' | 'category' | 'brand') {
    const index = { status: 0, category: 1, brand: 2 }[name];
    return this.main.getByRole('combobox').nth(index);
  }

  row(index = 0) { return this.page.locator('tbody tr').nth(index); }
  rows() { return this.page.locator('tbody tr'); }

  async firstProductName() {
    const row = this.row();
    await expect(row).toBeVisible();
    const text = (await row.locator('td').nth(1).innerText()).trim().split('\n')[0];
    expect(text, 'First product name').not.toBe('');
    return text;
  }

  async openFilter(name: 'status' | 'category' | 'brand') {
    await this.filter(name).click();
  }

  async openNewProduct() {
    await this.newProduct.click();
    await expect(this.page).toHaveURL(/\/admin\/products\/new\/?$/);
  }

  async openFirstEdit() {
    const edit = this.row().locator('td').nth(1).getByRole('link').first();
    await expect(edit).toBeVisible();
    await edit.click();
    await expect(this.page).toHaveURL(/\/admin\/products\/[^/]+\/edit\/?$/);
  }

  async openFirstDeleteDialog() {
    await this.row().locator('button').last().click();
    await expect(this.page.getByRole('heading', { name: 'Delete product?', exact: true })).toBeVisible();
  }
}
