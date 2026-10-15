import { categoryTableHeaders } from '../../../pages/categories.page';
import { test, expect } from '../../../fixtures/categories.fixture';

test.describe('Admin categories - functional @categories @functional', () => {
  test.beforeEach(async ({ categories }) => categories.open());

  test('CAT-F-001 displays category identity and primary controls @smoke', async ({ categories }) => {
    await expect(categories.description).toBeVisible();
    await expect(categories.search).toBeVisible();
    await expect(categories.newCategory).toBeVisible();
  });

  test('CAT-F-002 displays category table structure and data', async ({ page, categories }) => {
    for (const header of categoryTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    await expect(categories.row()).toBeVisible();
  });

  test('CAT-F-003 searches an existing category', async ({ categories }) => {
    const name = await categories.firstCategoryName();
    await categories.search.fill(name);
    await expect(categories.row()).toContainText(name);
    await categories.search.clear();
  });

  test('CAT-F-004 New Category contains all configured fields', async ({ page, categories }) => {
    await categories.openNewModal();
    for (const label of ['Name', 'Description', 'Image', 'Parent', 'Sort order', 'Active']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /upload image/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create category/i })).toBeVisible();
  });

  test('CAT-F-005 Edit Category loads existing values without saving', async ({ page, categories }) => {
    const name = await categories.firstCategoryName();
    await categories.openFirstEdit();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name);
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('CAT-F-006 Delete Category explains impact and supports cancellation', async ({ page, categories }) => {
    const name = await categories.firstCategoryName();
    await categories.openFirstDelete();
    await expect(page.getByText(/will be removed/i)).toContainText(name);
    await expect(page.getByText(/Products keep their data but lose this category/i)).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Delete category?', exact: true })).toBeHidden();
  });
});
