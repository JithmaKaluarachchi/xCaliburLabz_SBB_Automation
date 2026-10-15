import { productStatuses, productTableHeaders } from '../../../pages/products.page';
import { test, expect } from '../../../fixtures/products.fixture';

test.describe('Admin products - functional @products @functional', () => {
  test.beforeEach(async ({ products }) => products.open());

  test('PROD-F-001 displays product catalog identity and controls @smoke', async ({ products }) => {
    await expect(products.description).toBeVisible();
    await expect(products.search).toBeVisible();
    await expect(products.newProduct).toBeVisible();
    for (const name of ['status', 'category', 'brand'] as const) await expect(products.filter(name)).toBeVisible();
  });

  test('PROD-F-002 displays the product table structure and data', async ({ page, products }) => {
    for (const header of productTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    await expect(products.row()).toBeVisible();
  });

  test('PROD-F-003 searches by an existing product name without changing data', async ({ products }) => {
    const name = await products.firstProductName();
    await products.search.fill(name);
    await expect(products.row()).toContainText(name);
    await products.search.clear();
  });

  test('PROD-F-004 exposes status, category and brand filter choices', async ({ page, products }) => {
    await products.openFilter('status');
    for (const option of productStatuses) await expect(page.getByText(option, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    for (const name of ['category', 'brand'] as const) {
      await products.openFilter(name);
      await expect(page.getByText(new RegExp(`All ${name}`, 'i')).last()).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });

  test('PROD-F-005 supports row selection, bulk menu and clear without applying a change', async ({ page, products }) => {
    const checkbox = products.row().getByRole('checkbox');
    await checkbox.click();
    await expect(page.getByText('1 selected', { exact: true })).toBeVisible();
    await products.main.getByRole('combobox').nth(3).click();
    for (const option of ['Set Active', 'Set Draft', 'Set Archived']) await expect(page.getByText(option, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(checkbox).not.toBeChecked();
  });

  test('PROD-F-006 opens and validates the New Product form without submitting', async ({ page, products }) => {
    await products.openNewProduct();
    await expect(page.getByRole('heading', { name: /new product/i })).toBeVisible();
    for (const label of ['Name', 'SKU', 'Status', 'Price (LKR)', 'Compare-at', 'Weight (kg)', 'Short description', 'Description', 'Category', 'Brand']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText('Featured', { exact: true })).toBeVisible();
    await expect(page.getByText('Primary image', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /create product/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /cancel/i }).or(page.getByRole('button', { name: /cancel/i }))).toBeVisible();
  });

  test('PROD-F-007 opens and validates Edit Product, Images and Specifications without saving', async ({ page, products }) => {
    await products.openFirstEdit();
    await expect(page.getByRole('heading', { name: /edit product/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
    await expect(page.getByText('Images', { exact: true })).toBeVisible();
    await expect(page.getByText('Specifications', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Group (optional)')).toBeVisible();
    await expect(page.getByRole('button', { name: /^add$/i })).toBeVisible();
  });

  test('PROD-F-008 opens and cancels soft-delete confirmation without deleting', async ({ page, products }) => {
    const name = await products.firstProductName();
    await products.openFirstDeleteDialog();
    await expect(page.getByText(/will be archived \(soft delete\)/i)).toContainText(name);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Delete product?', exact: true })).toBeHidden();
  });
});
