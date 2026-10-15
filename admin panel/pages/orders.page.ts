import { expect, Locator, Page } from '@playwright/test';

export const orderTableHeaders = ['Order #', 'Customer', 'Total', 'Update status', 'Payment', 'Date', 'Actions'] as const;

export class OrdersPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly search: Locator;
  readonly statusFilter: Locator;
  readonly paymentFilter: Locator;
  readonly dateInputs: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Orders', exact: true });
    this.description = page.getByText('Customer orders and fulfilment.', { exact: true });
    this.search = page.getByPlaceholder('Search order #');
    this.statusFilter = page.getByRole('combobox').nth(0);
    this.paymentFilter = page.getByRole('combobox').nth(1);
    this.dateInputs = page.locator('input[type="date"]');
  }

  async open() {
    const response = await this.page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Orders returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
    await expect(this.row()).toBeVisible();
  }

  rows() { return this.page.locator('tbody tr'); }
  row(index = 0) { return this.rows().nth(index); }
  rowByOrder(orderNumber: string) { return this.rows().filter({ hasText: orderNumber }); }

  async firstOrderData() {
    const cells = this.row().locator('td');
    return {
      number: (await cells.nth(0).innerText()).trim(),
      customer: (await cells.nth(1).innerText()).trim(),
      total: (await cells.nth(2).innerText()).trim(),
      status: (await cells.nth(3).innerText()).trim(),
      payment: (await cells.nth(4).innerText()).trim(),
      date: (await cells.nth(5).innerText()).trim()
    };
  }

  async chooseFilter(filter: Locator, option: string) {
    await filter.click();
    await this.page.getByRole('option', { name: option, exact: true }).click();
  }

  async openFirstDetails() {
    const data = await this.firstOrderData();
    await this.row().getByRole('link', { name: /view order/i }).click();
    await expect(this.page).toHaveURL(/\/admin\/orders\/[^/]+\/?$/);
    await expect(this.page.getByRole('heading', { name: `Order ${data.number}`, exact: true })).toBeVisible();
    return data;
  }

  async openFirstDeleteDialog() {
    const data = await this.firstOrderData();
    await this.row().getByRole('button', { name: /delete/i }).click();
    await expect(this.page.getByRole('heading', { name: 'Delete order?', exact: true })).toBeVisible();
    return data;
  }
}
