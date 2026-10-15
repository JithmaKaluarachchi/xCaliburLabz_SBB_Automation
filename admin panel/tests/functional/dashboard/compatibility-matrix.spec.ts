import AxeBuilder from '@axe-core/playwright';
import { dashboardMetrics, trendRanges } from '../../../pages/dashboard.page';
import { test, expect } from '../../../fixtures/dashboard.fixture';

test.describe('Admin dashboard compatibility matrix @dashboard @dashboard-matrix', () => {
  test('DASH-MATRIX-F-001 content, metrics, trends and recent activity work @functional', async ({ dashboard }) => {
    await dashboard.open();
    await expect(dashboard.description).toBeVisible();
    for (const label of dashboardMetrics) {
      await expect(dashboard.metric(label)).toBeVisible();
      await expect(dashboard.metric(label)).toContainText(/\d/);
    }
    for (const range of trendRanges) await dashboard.selectRange(range);
    await dashboard.recentOrders.scrollIntoViewIfNeeded();
    await expect(dashboard.recentOrders).toBeVisible();
    await expect(dashboard.recentPayments).toBeVisible();
    await expect(dashboard.allOrders).toHaveAttribute('href', '/admin/orders');
  });

  test('DASH-MATRIX-UI-001 dashboard is usable on the configured web or mobile profile @ui', async ({ page, dashboard }) => {
    await dashboard.open();
    for (const range of trendRanges) {
      const box = await dashboard.range(range).boundingBox();
      expect(box).not.toBeNull();
      expect(Math.round(box!.height)).toBeGreaterThanOrEqual(24);
    }
    await dashboard.recentPayments.scrollIntoViewIfNeeded();
    const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(metrics.content).toBeLessThanOrEqual(metrics.viewport + 1);
  });

  test('DASH-MATRIX-NF-001 accessibility, HTTPS and runtime quality checks pass @nonfunctional', async ({ page, dashboard }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await dashboard.open();
    const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('dashboard-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    expect(axe.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(page.url()).toMatch(/^https:\/\//);
    expect(page.url()).not.toContain('/admin/login');
    await dashboard.selectRange('7d');
    expect(errors).toEqual([]);
  });
});
