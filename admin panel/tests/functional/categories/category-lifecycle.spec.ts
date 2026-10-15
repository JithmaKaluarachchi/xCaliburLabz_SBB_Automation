import path from 'node:path';
import { test, expect } from '../../../fixtures/categories.fixture';

test.describe('Admin category lifecycle @categories @functional @mutation', () => {
  test('CAT-F-007 validates, creates, edits, verifies and deletes its own category', async ({ page, categories }) => {
    test.setTimeout(90_000);
    const stamp = Date.now();
    const originalName = `AUTO Category ${stamp}`;
    const editedName = `${originalName} Edited`;
    const originalDescription = 'Automation category created to validate the complete category form.';
    const editedDescription = 'Updated by the automated category edit and persistence test.';
    let created = false;

    try {
      await categories.open();
      await categories.openNewModal();
      await page.getByRole('button', { name: /create category/i }).click();
      await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');

      await page.getByLabel('Name', { exact: true }).fill(originalName);
      await page.getByLabel('Description', { exact: true }).fill(originalDescription);
      await page.getByLabel('Sort order', { exact: true }).fill('25');
      await page.locator('input[type="file"]').setInputFiles(path.resolve('tests/fixtures/product-test-image.svg'));
      await page.getByRole('button', { name: /create category/i }).click();
      await expect(page.getByRole('heading', { name: 'New category', exact: true })).toBeHidden({ timeout: 20_000 });
      created = true;

      await categories.open();
      const createdRow = categories.rowByText(originalName);
      await expect(createdRow).toHaveCount(1);
      await expect(createdRow).toContainText(/auto-category-/i);
      await expect(createdRow).toContainText('Active');

      await categories.openEditFor(originalName);
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(originalName);
      await expect(page.getByLabel('Description', { exact: true })).toHaveValue(originalDescription);
      await expect(page.getByLabel('Sort order', { exact: true })).toHaveValue('25');
      await page.getByLabel('Name', { exact: true }).fill(editedName);
      await page.getByLabel('Description', { exact: true }).fill(editedDescription);
      await page.getByLabel('Sort order', { exact: true }).fill('30');
      await page.getByRole('button', { name: /save changes/i }).click();
      await expect(page.getByRole('heading', { name: 'Edit category', exact: true })).toBeHidden({ timeout: 20_000 });

      await expect(categories.rowByText(editedName)).toHaveCount(1);
      await categories.openEditFor(editedName);
      await expect(page.getByLabel('Name', { exact: true })).toHaveValue(editedName);
      await expect(page.getByLabel('Description', { exact: true })).toHaveValue(editedDescription);
      await expect(page.getByLabel('Sort order', { exact: true })).toHaveValue('30');
      await page.keyboard.press('Escape');

      await categories.openDeleteFor(editedName);
      await expect(page.getByText(/will be removed/i)).toContainText(editedName);
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Delete category?', exact: true })).toBeHidden({ timeout: 20_000 });
      created = false;
      await expect(categories.rowByText(editedName)).toHaveCount(0);
    } finally {
      if (created) {
        await categories.open();
        const generated = categories.rowByText(originalName);
        if (await generated.count() === 1) {
          await categories.openDeleteFor(originalName);
          await page.getByRole('button', { name: 'Delete', exact: true }).click();
        }
      }
    }
  });
});
