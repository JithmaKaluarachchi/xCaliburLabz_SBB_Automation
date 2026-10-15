import { test as base } from '@playwright/test';
import { SideNavigationPage } from '../pages/side-navigation.page';

export const test = base.extend<{ sideNavigation: SideNavigationPage }>({
  sideNavigation: async ({ page }, use) => use(new SideNavigationPage(page))
});
export { expect } from '@playwright/test';
