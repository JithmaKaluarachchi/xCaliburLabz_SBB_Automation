import { expect, Locator, Page } from '@playwright/test';

export const couponHeaders = ['Code', 'Discount', 'Used', 'Expires', 'Status', 'Actions'] as const;

export class CouponsPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly search: Locator;
  readonly newCoupon: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Coupons', exact: true });
    this.description = page.getByText('Discount codes for checkout.', { exact: true });
    this.search = page.getByPlaceholder('Search code');
    this.newCoupon = page.getByRole('button', { name: /new coupon/i });
  }

  async open() {
    const response = await this.page.goto('/admin/coupons', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Coupons returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
    await expect(this.row()).toBeVisible();
  }
  rows() { return this.page.locator('tbody tr'); }
  row(index = 0) { return this.rows().nth(index); }
  rowByCode(code: string) { return this.rows().filter({ hasText: code }); }
  async firstCode() { return (await this.row().locator('td').first().innerText()).trim(); }
  async openNew() {
    await this.newCoupon.click();
    await expect(this.page.getByRole('heading', { name: 'New coupon', exact: true })).toBeVisible();
  }
  async openEdit(code: string) {
    const row = this.rowByCode(code); await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: /edit/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Edit coupon', exact: true })).toBeVisible();
  }
  async openDelete(code: string) {
    const row = this.rowByCode(code); await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: /delete/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Delete coupon?', exact: true })).toBeVisible();
  }
}
