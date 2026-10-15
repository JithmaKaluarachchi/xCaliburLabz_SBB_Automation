import AxeBuilder from '@axe-core/playwright';
import { adminRoutes } from '../../../pages/side-navigation.page';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test.describe('Admin side navigation compatibility matrix @side-navigation @matrix', () => {
  test('SIDENAV-MATRIX-F-001 branding, groups, links and every destination work @functional', async ({ page, sideNavigation }, testInfo) => {
    await sideNavigation.authenticate(); await sideNavigation.ensureOpen();
    const brand = sideNavigation.brand();
    await expect(brand).toContainText(/SBB Oxygen (?:House|Admin)/i);
    for (const group of ['Overview','Catalog','Sales','Content','Operations','System'])
      await expect(sideNavigation.group(group)).toBeVisible();
    const visited: string[] = [];
    for (const [name, path] of adminRoutes) {
      await sideNavigation.ensureOpen(); await expect(sideNavigation.link(name)).toHaveAttribute('href', path);
      await sideNavigation.goThroughSidebar(name, path); visited.push(`${name}: ${page.url()}`);
    }
    await testInfo.attach('visited-admin-routes.txt', { body: visited.join('\n'), contentType: 'text/plain' });
  });

  test('SIDENAV-MATRIX-UI-001 sidebar is usable on the configured web or mobile profile @ui', async ({ page, sideNavigation }) => {
    await sideNavigation.authenticate(); await sideNavigation.ensureOpen(); await expect(sideNavigation.sidebar).toBeVisible();
    for (const [name] of adminRoutes) {
      const link = sideNavigation.link(name); await expect(link).toBeVisible();
      const box = await link.boundingBox(); expect(box).not.toBeNull(); expect(box!.height).toBeGreaterThanOrEqual(32);
      expect(await link.evaluate(e => e.scrollWidth > e.clientWidth + 1), `${name} is clipped`).toBeFalsy();
    }
    await sideNavigation.link('Dashboard').focus(); await expect(sideNavigation.link('Dashboard')).toBeFocused();
    const metrics = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(metrics.content).toBeLessThanOrEqual(metrics.viewport + 1);
  });

  test('SIDENAV-MATRIX-NF-001 accessibility, HTTPS and runtime quality checks pass @nonfunctional', async ({ page, sideNavigation }, testInfo) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await sideNavigation.authenticate(); await sideNavigation.ensureOpen();
    const axe = await new AxeBuilder({ page }).include('aside').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await testInfo.attach('sidebar-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    expect(axe.violations.filter(v => v.impact === 'critical')).toEqual([]);
    for (const [name, path] of adminRoutes) {
      await sideNavigation.goThroughSidebar(name, path);
      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(path.replace(/\/$/, '')); expect(page.url()).not.toContain('/admin/login');
    }
    await testInfo.attach('sidebar-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
});
