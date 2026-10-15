import { adminRoutes } from '../../../pages/side-navigation.page';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test('SIDENAV-NF-SEC-001 all sidebar destinations remain authenticated HTTPS admin routes @side-navigation @nonfunctional @security', async ({ page, sideNavigation }) => {
  await sideNavigation.authenticate();
  for (const [name, path] of adminRoutes) {
    await sideNavigation.goThroughSidebar(name, path);
    expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(path.replace(/\/$/, ''));
    expect(page.url()).not.toMatch(/\/admin\/login/);
  }
});
