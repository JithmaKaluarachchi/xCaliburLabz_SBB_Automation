import { expect, Locator, Page } from '@playwright/test';

export const categoryTableHeaders = ['Name', 'Slug', 'Products', 'Status', 'Actions'] as const;

export class CategoriesPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly main: Locator;
  readonly search: Locator;
  readonly newCategory: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Categories', exact: true });
    this.description = page.getByText('Organise products into categories.', { exact: true });
    this.main = page.locator('main');
    this.search = page.getByPlaceholder('Search categories');
    this.newCategory = page.getByRole('button', { name: /new category/i });
  }

  async open() {
    const response = await this.page.goto('/admin/categories', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Categories returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
    await expect(this.row()).toBeVisible();
  }

  row(index = 0) { return this.page.locator('tbody tr').nth(index); }
  rows() { return this.page.locator('tbody tr'); }
  rowByText(text: string) { return this.page.locator('tbody tr').filter({ hasText: text }); }

  async firstCategoryName() {
    const row = this.row();
    await expect(row).toBeVisible();
    return (await row.locator('td').first().innerText()).trim().split('\n')[0];
  }

  async openNewModal() {
    await this.newCategory.click();
    await expect(this.page.getByRole('heading', { name: 'New category', exact: true })).toBeVisible();
  }

  async openFirstEdit() {
    await this.row().getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit category', exact: true })).toBeVisible();
  }

  async openFirstDelete() {
    await this.row().getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Delete category?', exact: true })).toBeVisible();
  }

  async openEditFor(text: string) {
    const row = this.rowByText(text);
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit category', exact: true })).toBeVisible();
  }

  async openDeleteFor(text: string) {
    const row = this.rowByText(text);
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(this.page.getByRole('heading', { name: 'Delete category?', exact: true })).toBeVisible();
  }
}
