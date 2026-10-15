import { adminRoutes } from '../../../pages/side-navigation.page';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test.describe('Admin side navigation - functional @side-navigation @functional', () => {
  test.beforeEach(async ({ sideNavigation }) => { await sideNavigation.authenticate(); await sideNavigation.ensureOpen(); });

  test('SIDENAV-F-001 displays SBB Oxygen House and ADMIN branding @smoke', async ({ sideNavigation }) => {
    const brand = sideNavigation.brand();
    await expect(brand).toContainText(/SBB Oxygen (?:House|Admin)/i);
  });

  test('SIDENAV-F-002 displays every navigation group', async ({ sideNavigation }) => {
    for (const group of ['Overview', 'Catalog', 'Sales', 'Content', 'Operations', 'System'])
      await expect(sideNavigation.group(group)).toBeVisible();
  });

  test('SIDENAV-F-003 exposes all required links with exact destinations', async ({ sideNavigation }) => {
    for (const [name, path] of adminRoutes)
      await expect(sideNavigation.link(name)).toHaveAttribute('href', path);
  });

  test('SIDENAV-F-004 every sidebar page is accessible from its link', async ({ sideNavigation }, testInfo) => {
    const visited: string[] = [];
    for (const [name, path] of adminRoutes) {
      await sideNavigation.goThroughSidebar(name, path);
      visited.push(`${name}: ${sideNavigation.page.url()}`);
    }
    await testInfo.attach('visited-admin-routes.txt', { body: visited.join('\n'), contentType: 'text/plain' });
  });

  test('SIDENAV-F-005 dashboard brand link returns to the dashboard', async ({ page, sideNavigation }) => {
    await sideNavigation.goThroughSidebar('Products', '/admin/products');
    await sideNavigation.ensureOpen();
    await sideNavigation.homeLink().click();
    await expect(page).toHaveURL(/\/admin\/?$/);
  });
});
