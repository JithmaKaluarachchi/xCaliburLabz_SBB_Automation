import { adminRoutes } from '../../../pages/side-navigation.page';
import { test, expect } from '../../../fixtures/side-navigation.fixture';

test('SIDENAV-NF-QUAL-001 sidebar routes load without uncaught page errors @side-navigation @nonfunctional @quality', async ({ page, sideNavigation }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await sideNavigation.authenticate();
  for (const [name, path] of adminRoutes) await sideNavigation.goThroughSidebar(name, path);
  await testInfo.attach('sidebar-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
