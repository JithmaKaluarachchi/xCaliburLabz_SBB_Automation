import { test, expect } from '../../../fixtures/orders.fixture';

test.describe('Admin orders UI @orders @functional @ui', () => {
  test('ORDER-UI-001 controls are visible, focusable and adequately sized', async ({ orders }) => {
    await orders.open();
    for (const control of [orders.search, orders.statusFilter, orders.paymentFilter]) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
    await orders.search.focus();
    await expect(orders.search).toBeFocused();
  });

  test('ORDER-UI-002 delete dialog traps the destructive action behind confirmation', async ({ page, orders }) => {
    await orders.open();
    await orders.openFirstDeleteDialog();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Delete order?', exact: true })).toBeHidden();
  });
});
