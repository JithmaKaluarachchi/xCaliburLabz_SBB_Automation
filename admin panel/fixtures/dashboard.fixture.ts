import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';

export const test = base.extend<{ dashboard: DashboardPage }>({
  dashboard: async ({ page }, use) => use(new DashboardPage(page))
});
export { expect } from '@playwright/test';
