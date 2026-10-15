import path from 'node:path';
import { test, expect } from '../../../fixtures/products.fixture';

test.describe('Admin product form lifecycle @products @functional @mutation', () => {
  test('PROD-F-009 validates, creates, edits, verifies and archives an automation product', async ({ page, products }) => {
    test.setTimeout(120_000);
    const stamp = Date.now();
    const originalName = `AUTO Product ${stamp}`;
    const editedName = `${originalName} Edited`;
    const sku = `AUTO-PROD-${stamp}`;
    let created = false;

    const field = (label: string) => page.getByLabel(label, { exact: true });

    try {
      await products.open();
      await products.openNewProduct();

      await page.getByRole('button', { name: /create product/i }).click();
      await expect(page).toHaveURL(/\/admin\/products\/new\/?$/);
      await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
      await expect(page.getByText('SKU is required', { exact: true })).toBeVisible();
      await expect(page.getByText('Select a category', { exact: true })).toBeVisible();
      await expect(field('Name')).toHaveAttribute('aria-invalid', 'true');

      await field('Name').fill(originalName);
      await field('SKU').fill(sku);
      await field('Price (LKR)').fill('12500');
      await field('Compare-at').fill('15000');
      await field('Weight (kg)').fill('12.5');
      await field('Short description').fill('Automation-created product used to verify the admin form.');
      await field('Description').fill('Created by Playwright for controlled create, edit, persistence, validation, image and specification testing.');

      const formComboboxes = page.locator('main').getByRole('combobox');
      await formComboboxes.nth(1).click();
      const categoryOptions = page.getByRole('option');
      expect(await categoryOptions.count(), 'At least one product category is available').toBeGreaterThan(0);
      await categoryOptions.first().click();

      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(path.resolve('tests/fixtures/product-test-image.svg'));

      await page.getByRole('button', { name: /create product/i }).click();
      await expect(page).toHaveURL(/\/admin\/products\/[^/]+\/edit\?created=1$/, { timeout: 20_000 });
      created = true;

      await expect(field('Name')).toHaveValue(originalName);
      await expect(field('SKU')).toHaveValue(sku);
      await expect(field('Price (LKR)')).toHaveValue('12500');
      await field('Name').fill(editedName);
      await field('Price (LKR)').fill('13500');
      await field('Weight (kg)').fill('13');
      await field('Short description').fill('Updated by the automated edit-product test.');
      await page.getByPlaceholder('Group (optional)').fill('Automation');
      await page.getByPlaceholder('Name', { exact: true }).last().fill('Pressure');
      await page.getByPlaceholder('Value', { exact: true }).fill('150 bar');
      await page.getByRole('button', { name: /^add$/i }).click();
      await page.getByRole('button', { name: /save changes/i }).click();
      await expect(page).toHaveURL(/\/admin\/products\/?$/, { timeout: 20_000 });

      await products.search.fill(sku);
      await expect(products.row()).toContainText(editedName);
      await products.row().locator('td').nth(1).getByRole('link').first().click();
      await expect(field('Name')).toHaveValue(editedName);
      await expect(field('Price (LKR)')).toHaveValue('13500');
      await expect(field('Weight (kg)')).toHaveValue('13');
      await expect(field('Short description')).toHaveValue('Updated by the automated edit-product test.');
    } finally {
      if (created) {
        await products.open();
        await products.search.fill(sku);
        if (await products.row().isVisible().catch(() => false)) {
          await products.openFirstDeleteDialog();
          await page.getByRole('button', { name: 'Delete', exact: true }).click();
          await expect(page.getByRole('heading', { name: 'Delete product?', exact: true })).toBeHidden({ timeout: 20_000 });
        }
      }
    }
  });
});
