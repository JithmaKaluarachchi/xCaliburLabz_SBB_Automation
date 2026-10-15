import { test, expect } from '../../../fixtures/products.fixture';

test.describe('Admin products - UI @products @ui @functional', () => {
  test.beforeEach(async ({ products }) => products.open());

  test('PROD-UI-001 key controls are visible and usable', async ({ products }) => {
    for (const control of [products.search, products.filter('status'), products.filter('category'), products.filter('brand'), products.newProduct]) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
  });

  test('PROD-UI-002 search supports keyboard focus', async ({ products }) => {
    await products.search.focus();
    await expect(products.search).toBeFocused();
  });

  test('PROD-UI-003 delete modal presents safe cancel and destructive delete actions', async ({ page, products }) => {
    await products.openFirstDeleteDialog();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });
});
