import { expect, Locator, Page } from '@playwright/test';

export const brandTableHeaders = ['Name', 'Website', 'Products', 'Status', 'Actions'] as const;

export class BrandsPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly main: Locator;
  readonly search: Locator;
  readonly newBrand: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Brands', exact: true });
    this.description = page.getByText('Manufacturers and suppliers.', { exact: true });
    this.main = page.locator('main');
    this.search = page.getByPlaceholder('Search brands');
    this.newBrand = page.getByRole('button', { name: /new brand/i });
  }

  async open() {
    const response = await this.page.goto('/admin/brands', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Brands returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
    await expect(this.row()).toBeVisible();
  }

  row(index = 0) { return this.page.locator('tbody tr').nth(index); }
  rows() { return this.page.locator('tbody tr'); }
  rowByText(text: string) { return this.page.locator('tbody tr').filter({ hasText: text }); }

  async firstBrandName() {
    return (await this.row().locator('td').first().innerText()).trim().split('\n')[0];
  }

  async openNewModal() {
    await this.newBrand.click();
    await expect(this.page.getByRole('heading', { name: 'New brand', exact: true })).toBeVisible();
  }

  async openEditFor(text: string) {
    const row = this.rowByText(text);
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit brand', exact: true })).toBeVisible();
  }

  async openDeleteFor(text: string) {
    const row = this.rowByText(text);
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Delete brand?', exact: true })).toBeVisible();
  }
}
