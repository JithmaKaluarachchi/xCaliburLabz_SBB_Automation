import { test, expect } from '../../../fixtures/orders.fixture';
import { orderTestData } from '../../test-data/orders.data';

test.describe('Admin order details @orders @functional @details', () => {
  test.beforeEach(async ({ orders }) => {
    await orders.open();
    await orders.openFirstDetails();
  });

  test('ORDER-DETAIL-F-001 view navigates to matching order details', async ({ page }) => {
    await expect(page.getByText('Items', { exact: true })).toBeVisible();
    await expect(page.getByText('Customer & shipping', { exact: true })).toBeVisible();
    await expect(page.getByText('Timeline', { exact: true })).toBeVisible();
  });

  test('ORDER-DETAIL-F-002 displays item and financial summary', async ({ page }) => {
    for (const text of ['Product', 'Qty', 'Unit', 'Subtotal', 'Discount', 'Shipping', 'Total']) {
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    }
  });

  test('ORDER-DETAIL-F-003 status update requires a selected status', async ({ page }) => {
    const statusCard = page.getByText('Status', { exact: true }).first().locator('..');
    await expect(statusCard.getByRole('button', { name: /update status/i })).toBeDisabled();
    await expect(page.getByPlaceholder('Note (optional)').first()).toBeVisible();
  });

  test('ORDER-DETAIL-F-004 status editor exposes transitions without submitting', async ({ page }) => {
    await page.getByRole('combobox').nth(0).click();
    expect(await page.getByRole('option').count()).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
  });

  test('ORDER-DETAIL-F-005 payment editor exposes valid test-data states without submitting', async ({ page }) => {
    await page.getByRole('combobox').nth(1).click();
    for (const state of orderTestData.detailPaymentStatuses) {
      await expect(page.getByRole('option', { name: state, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  });

  test('ORDER-DETAIL-F-006 payment update requires a selected state', async ({ page }) => {
    await expect(page.getByRole('button', { name: /update payment status/i })).toBeDisabled();
  });

  test('ORDER-DETAIL-F-007 invoice action is available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /download invoice/i })).toBeVisible();
  });
});
