import { test, expect } from '../../../fixtures/side-navigation.fixture';

test('SIDENAV-NF-RESP-001 sidebar opens and fits web or mobile viewport @side-navigation @nonfunctional @responsive', async ({ page, sideNavigation }) => {
  await sideNavigation.authenticate(); await sideNavigation.ensureOpen();
  await sideNavigation.link('Account & Access').scrollIntoViewIfNeeded();
  await expect(sideNavigation.link('Account & Access')).toBeInViewport();
  const m = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
  expect(m.content).toBeLessThanOrEqual(m.viewport + 1);
});

test('SIDENAV-NF-RESP-002 long mobile menu scrolls to System while branding remains usable @side-navigation @nonfunctional @responsive', async ({ page, sideNavigation }) => {
  await sideNavigation.authenticate(); await sideNavigation.ensureOpen();

  const account = sideNavigation.link('Account & Access');
  await account.scrollIntoViewIfNeeded();
  await expect(account).toBeInViewport();
  await expect(sideNavigation.group('System')).toBeInViewport();
  await expect(sideNavigation.brand()).toBeVisible();

  const bounds = await sideNavigation.sidebar.boundingBox();
  const viewport = page.viewportSize();
  expect(bounds).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.width + 1);
});
