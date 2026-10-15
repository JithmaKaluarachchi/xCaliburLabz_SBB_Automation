import AxeBuilder from '@axe-core/playwright';
import { orderTableHeaders } from '../../../pages/orders.page';
import { test, expect } from '../../../fixtures/orders.fixture';

test.describe('Admin orders compatibility matrix @orders @orders-matrix', () => {
  test('ORDER-MATRIX-F-001 list, search and details navigation work @functional', async ({ page, orders }) => {
    await orders.open();
    for (const header of orderTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    const data = await orders.firstOrderData();
    await orders.search.fill(data.number);
    await expect(orders.rowByOrder(data.number)).toHaveCount(1);
    await orders.openFirstDetails();
    await expect(page.getByText('Items', { exact: true })).toBeVisible();
  });

  test('ORDER-MATRIX-UI-001 fits the configured web or mobile profile @ui', async ({ page, orders }) => {
    await orders.open();
    await expect(orders.search).toBeVisible();
    const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(size.content).toBeLessThanOrEqual(size.viewport + 1);
  });

  test('ORDER-MATRIX-NF-001 accessibility, HTTPS and runtime quality pass @nonfunctional', async ({ page, orders }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await orders.open();
    const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('orders-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    const critical = axe.violations.filter(v => v.impact === 'critical');
    const summary = critical.map(v => `${v.id}: ${v.nodes.length} affected element(s)`).join('; ');
    expect(critical.length, `Critical accessibility violations: ${summary}`).toBe(0);
    expect(page.url()).toMatch(/^https:\/\//);
    expect(errors).toEqual([]);
  });
});
