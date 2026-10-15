import path from 'node:path';
import { test, expect } from '../../../fixtures/brands.fixture';
import { createBrandTestData } from '../../test-data/brands.data';

test.describe('Admin brand lifecycle @brands @functional @mutation', () => {
  test('BRAND-F-007 validates, creates, edits, verifies and deletes its own brand', async ({ page, brands }) => {
    test.setTimeout(90_000);
    const data = createBrandTestData();
    const {
      originalName,
      editedName,
      originalDescription,
      editedDescription,
      originalWebsite,
      editedWebsite
    } = data;
    let created = false;

    try {
      await brands.open();
      await brands.openNewModal();
      await page.getByRole('button', { name: /create brand/i }).click();
      await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');

      await page.getByLabel('Name', { exact: true }).fill(originalName);
      await page.getByLabel('Description', { exact: true }).fill(originalDescription);
      await page.getByLabel('Website', { exact: true }).fill(originalWebsite);
      await page.locator('input[type="file"]').setInputFiles(path.resolve('tests/fixtures/product-test-image.svg'));
      await page.getByRole('button', { name: /create brand/i }).click();
      await expect(page.getByRole('heading', { name: 'New brand', exact: true })).toBeHidden({ timeout: 20_000 });
      created = true;

      await brands.open();
      const createdRow = brands.rowByText(originalName);
      await expect(createdRow).toHaveCount(1);
      await expect(createdRow).toContainText(originalWebsite);
      await expect(createdRow).toContainText('Active');

      await brands.openEditFor(originalName);
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(originalName);
      await expect(page.getByLabel('Description', { exact: true })).toHaveValue(originalDescription);
      await expect(page.getByLabel('Website', { exact: true })).toHaveValue(originalWebsite);
      await page.getByLabel('Name', { exact: true }).fill(editedName);
      await page.getByLabel('Description', { exact: true }).fill(editedDescription);
      await page.getByLabel('Website', { exact: true }).fill(editedWebsite);
      await page.getByRole('button', { name: /save changes/i }).click();
      await expect(page.getByRole('heading', { name: 'Edit brand', exact: true })).toBeHidden({ timeout: 20_000 });

      await expect(brands.rowByText(editedName)).toHaveCount(1);
      await brands.openEditFor(editedName);
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(editedName);
      await expect(page.getByLabel('Description', { exact: true })).toHaveValue(editedDescription);
      await expect(page.getByLabel('Website', { exact: true })).toHaveValue(editedWebsite);
      await page.keyboard.press('Escape');

      await brands.openDeleteFor(editedName);
      await expect(page.getByText(/will be removed/i)).toContainText(editedName);
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(brands.rowByText(editedName)).toHaveCount(0);
      created = false;
    } finally {
      if (created) {
        await brands.open();
        const generated = brands.rowByText(originalName);
        if (await generated.count() === 1) {
          await brands.openDeleteFor(originalName);
          await page.getByRole('button', { name: 'Delete', exact: true }).click();
        }
      }
    }
  });
});
