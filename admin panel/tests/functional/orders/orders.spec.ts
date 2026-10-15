import { orderTableHeaders } from '../../../pages/orders.page';
import { test, expect } from '../../../fixtures/orders.fixture';
import { orderTestData } from '../../test-data/orders.data';

test.describe('Admin orders - functional @orders @functional', () => {
  test.beforeEach(async ({ orders }) => orders.open());

  test('ORDER-F-001 displays identity, filters and table data @smoke', async ({ page, orders }) => {
    await expect(orders.description).toBeVisible();
    await expect(orders.search).toBeVisible();
    await expect(orders.statusFilter).toBeVisible();
    await expect(orders.paymentFilter).toBeVisible();
    await expect(orders.dateInputs).toHaveCount(2);
    for (const header of orderTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
  });

  test('ORDER-F-002 searches using live read-only order test data', async ({ orders }) => {
    const data = await orders.firstOrderData();
    await orders.search.fill(data.number);
    await expect(orders.rowByOrder(data.number)).toHaveCount(1);
    await expect(orders.rowByOrder(data.number)).toContainText(data.customer);
  });

  test('ORDER-F-003 handles a no-result search safely', async ({ orders }) => {
    await orders.search.fill(orderTestData.invalidSearch);
    await expect(orders.rowByOrder(orderTestData.invalidSearch)).toHaveCount(0);
  });

  test('ORDER-F-004 exposes every order-status filter value', async ({ page, orders }) => {
    await orders.statusFilter.click();
    for (const status of orderTestData.statuses) await expect(page.getByRole('option', { name: status, exact: true })).toBeVisible();
  });

  test('ORDER-F-005 exposes every payment filter value', async ({ page, orders }) => {
    await orders.paymentFilter.click();
    for (const status of orderTestData.payments) await expect(page.getByRole('option', { name: status, exact: true })).toBeVisible();
  });

  test('ORDER-F-006 filters by the first row status without changing data', async ({ orders }) => {
    const data = await orders.firstOrderData();
    await orders.chooseFilter(orders.statusFilter, data.status);
    await expect(orders.row()).toContainText(data.status);
  });

  test('ORDER-F-007 filters by the first row payment state', async ({ orders }) => {
    const data = await orders.firstOrderData();
    await orders.chooseFilter(orders.paymentFilter, data.payment);
    await expect(orders.row()).toContainText(data.payment);
  });

  test('ORDER-F-008 date range controls accept and clear test dates', async ({ orders }) => {
    await orders.dateInputs.nth(0).fill('2026-08-01');
    await orders.dateInputs.nth(1).fill('2026-08-31');
    await expect(orders.dateInputs.nth(0)).toHaveValue('2026-08-01');
    await expect(orders.dateInputs.nth(1)).toHaveValue('2026-08-31');
    await orders.dateInputs.nth(0).fill('');
    await orders.dateInputs.nth(1).fill('');
  });

  test('ORDER-F-009 row status editor exposes configured transitions without saving', async ({ page, orders }) => {
    await orders.row().getByRole('combobox').click();
    const visibleOptions = page.getByRole('option');
    expect(await visibleOptions.count()).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
  });

  test('ORDER-F-010 delete warning identifies the order and cancellation preserves it', async ({ page, orders }) => {
    const data = await orders.openFirstDeleteDialog();
    await expect(page.getByText(/permanently removed/i)).toContainText(data.number);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(orders.rowByOrder(data.number)).toHaveCount(1);
  });
});
