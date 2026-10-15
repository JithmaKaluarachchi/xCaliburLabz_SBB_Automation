import { test, expect } from '../../../fixtures/categories.fixture';

test.describe('Admin categories - UI @categories @ui @functional', () => {
  test.beforeEach(async ({ categories }) => categories.open());

  test('CAT-UI-001 primary controls are visible and usable', async ({ categories }) => {
    for (const control of [categories.search, categories.newCategory]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(24);
    }
  });

  test('CAT-UI-002 search supports keyboard focus', async ({ categories }) => {
    await categories.search.focus();
    await expect(categories.search).toBeFocused();
  });

  test('CAT-UI-003 category dialog keeps keyboard focus inside the modal', async ({ page, categories }) => {
    await categories.openNewModal();
    await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'New category', exact: true })).toBeHidden();
  });
});
