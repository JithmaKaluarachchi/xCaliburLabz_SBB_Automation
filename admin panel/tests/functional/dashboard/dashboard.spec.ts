import { dashboardMetrics, trendRanges } from '../../../pages/dashboard.page';
import { test, expect } from '../../../fixtures/dashboard.fixture';

test.describe('Admin dashboard - functional @dashboard @functional', () => {
  test.beforeEach(async ({ dashboard }) => dashboard.open());

  test('DASH-F-001 displays the dashboard identity and description @smoke', async ({ dashboard }) => {
    await expect(dashboard.heading).toBeVisible();
    await expect(dashboard.description).toBeVisible();
  });

  test('DASH-F-002 displays all four summary metrics with values', async ({ dashboard }) => {
    for (const label of dashboardMetrics) {
      const card = dashboard.metric(label);
      await expect(card).toBeVisible();
      await expect(card).toContainText(/\d/);
    }
  });

  test('DASH-F-003 displays revenue and order trend charts', async ({ dashboard }) => {
    await expect(dashboard.trends).toBeVisible();
    await expect(dashboard.revenueChart).toBeVisible();
    await expect(dashboard.ordersChart).toBeVisible();
  });

  test('DASH-F-004 supports every trend date range', async ({ dashboard }) => {
    for (const range of trendRanges) await dashboard.selectRange(range);
  });

  test('DASH-F-005 displays recent orders and recent payments', async ({ dashboard }) => {
    await dashboard.recentOrders.scrollIntoViewIfNeeded();
    await expect(dashboard.recentOrders).toBeVisible();
    await expect(dashboard.recentPayments).toBeVisible();
  });

  test('DASH-F-006 All orders opens the orders page', async ({ page, dashboard }) => {
    await dashboard.allOrders.scrollIntoViewIfNeeded();
    await expect(dashboard.allOrders).toHaveAttribute('href', '/admin/orders');
    await dashboard.allOrders.click();
    await expect(page).toHaveURL(/\/admin\/orders\/?$/);
  });
});
