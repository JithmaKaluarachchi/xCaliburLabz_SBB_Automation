import { test, expect } from '../../../fixtures/login.fixture';

test.describe('Admin Login - UI @functional @ui', () => {
  test.beforeEach(async ({ loginPage }) => loginPage.open());

  test('LOGIN-UI-001 logo, login card and text are visible', async ({ page, loginPage }) => {
    await expect(page.getByRole('img', { name: 'SBB Oxygen House' })).toBeVisible();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.description).toBeVisible();
    await expect(loginPage.staffNotice).toBeVisible();
  });

  test('LOGIN-UI-002 controls have usable dimensions and are not clipped', async ({ loginPage }) => {
    for (const control of [loginPage.email, loginPage.password, loginPage.submit]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(200);
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('LOGIN-UI-003 focus order supports keyboard login', async ({ page, loginPage }) => {
    await page.keyboard.press('Tab');
    await expect(loginPage.email).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.password).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.submit).toBeFocused();
  });
});
