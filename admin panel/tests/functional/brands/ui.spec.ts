import { test, expect } from '../../../fixtures/brands.fixture';

test.describe('Admin brands - UI @brands @ui @functional', () => {
  test.beforeEach(async ({ brands }) => brands.open());

  test('BRAND-UI-001 primary controls are visible and usable', async ({ brands }) => {
    for (const control of [brands.search, brands.newBrand]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
  });

  test('BRAND-UI-002 search supports keyboard focus', async ({ brands }) => {
    await brands.search.focus();
    await expect(brands.search).toBeFocused();
  });

  test('BRAND-UI-003 brand dialog contains keyboard focus', async ({ page, brands }) => {
    await brands.openNewModal();
    await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'New brand', exact: true })).toBeHidden();
  });
});
