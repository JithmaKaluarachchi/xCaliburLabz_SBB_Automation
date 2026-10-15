import { test as base } from '@playwright/test';
import { CouponsPage } from '../pages/coupons.page';
export const test = base.extend<{ coupons: CouponsPage }>({ coupons: async ({ page }, use) => use(new CouponsPage(page)) });
export { expect } from '@playwright/test';
