import { expect, Locator, Page } from '@playwright/test';

export const dashboardMetrics = ['Revenue', 'Customers', 'Products', 'Orders'] as const;
export const trendRanges = ['7d', '21d', '30d', '90d'] as const;

export class DashboardPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly main: Locator;
  readonly trends: Locator;
  readonly revenueChart: Locator;
  readonly ordersChart: Locator;
  readonly recentOrders: Locator;
  readonly recentPayments: Locator;
  readonly allOrders: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Dashboard', exact: true });
    this.description = page.getByText('Store performance at a glance.', { exact: true });
    this.main = page.locator('main');
    this.trends = page.getByText('Trends', { exact: true });
    this.revenueChart = page.getByText(/Revenue \(last \d+ days\)/).first();
    this.ordersChart = page.getByText(/Orders \(last \d+ days\)/).first();
    this.recentOrders = page.getByText('Recent orders', { exact: true });
    this.recentPayments = page.getByText('Recent payments', { exact: true });
    this.allOrders = page.getByRole('link', { name: 'All orders', exact: true });
  }

  async open() {
    const response = await this.page.goto('/admin', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Dashboard returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
  }

  metric(label: typeof dashboardMetrics[number]) {
    return this.main.locator('div').filter({ has: this.page.getByText(label, { exact: true }) })
      .filter({ has: this.page.locator('svg') }).first();
  }

  range(label: typeof trendRanges[number]) {
    return this.page.getByRole('button', { name: label, exact: true });
  }

  async selectRange(label: typeof trendRanges[number]) {
    await this.range(label).click();
    await expect(this.revenueChart).toContainText(`last ${label.replace('d', '')} days`);
    await expect(this.ordersChart).toContainText(`last ${label.replace('d', '')} days`);
  }
}
