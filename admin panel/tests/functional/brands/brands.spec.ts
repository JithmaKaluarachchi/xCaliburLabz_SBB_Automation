import { brandTableHeaders } from '../../../pages/brands.page';
import { test, expect } from '../../../fixtures/brands.fixture';

test.describe('Admin brands - functional @brands @functional', () => {
  test.beforeEach(async ({ brands }) => brands.open());

  test('BRAND-F-001 displays brand identity and primary controls @smoke', async ({ brands }) => {
    await expect(brands.description).toBeVisible();
    await expect(brands.search).toBeVisible();
    await expect(brands.newBrand).toBeVisible();
  });

  test('BRAND-F-002 displays brand table structure and data', async ({ page, brands }) => {
    for (const header of brandTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    await expect(brands.row()).toBeVisible();
  });

  test('BRAND-F-003 searches an existing brand', async ({ brands }) => {
    const name = await brands.firstBrandName();
    await brands.search.fill(name);
    await expect(brands.rowByText(name)).toHaveCount(1);
  });

  test('BRAND-F-004 New Brand contains all configured fields', async ({ page, brands }) => {
    await brands.openNewModal();
    for (const label of ['Name', 'Description', 'Logo', 'Website', 'Active']) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByRole('button', { name: /upload logo/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create brand/i })).toBeVisible();
  });

  test('BRAND-F-005 Edit Brand loads existing values without saving', async ({ page, brands }) => {
    const name = await brands.firstBrandName();
    await brands.openEditFor(name);
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name);
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('BRAND-F-006 Delete Brand shows the selected name and supports cancellation', async ({ page, brands }) => {
    const name = await brands.firstBrandName();
    await brands.openDeleteFor(name);
    await expect(page.getByText(/will be removed/i)).toContainText(name);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Delete brand?', exact: true })).toBeHidden();
  });
});
