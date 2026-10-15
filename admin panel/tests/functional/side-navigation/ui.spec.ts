import { adminRoutes } from '../../../pages/side-navigation.page';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test.describe('Admin side navigation - UI @side-navigation @ui @functional', () => {
  test.beforeEach(async ({ sideNavigation }) => { await sideNavigation.authenticate(); await sideNavigation.ensureOpen(); });

  test('SIDENAV-UI-001 sidebar and all labels are visible without clipping', async ({ sideNavigation }) => {
    await expect(sideNavigation.sidebar).toBeVisible();
    for (const [name] of adminRoutes) {
      const link = sideNavigation.link(name); await expect(link).toBeVisible();
      const clipped = await link.evaluate((e) => e.scrollWidth > e.clientWidth + 1);
      expect(clipped, `${name} is clipped`).toBeFalsy();
    }
  });

  test('SIDENAV-UI-002 navigation links have usable target height', async ({ sideNavigation }) => {
    for (const [name] of adminRoutes) {
      const box = await sideNavigation.link(name).boundingBox();
      expect(box).not.toBeNull(); expect(box!.height, `${name} target height`).toBeGreaterThanOrEqual(32);
    }
  });

  test('SIDENAV-UI-003 first links support keyboard focus order', async ({ page, sideNavigation }) => {
    await sideNavigation.link('Dashboard').focus();
    await expect(sideNavigation.link('Dashboard')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(sideNavigation.link('Products')).toBeFocused();
  });
});
