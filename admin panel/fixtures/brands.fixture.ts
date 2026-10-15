import { test as base } from '@playwright/test';
import { BrandsPage } from '../pages/brands.page';

export const test = base.extend<{ brands: BrandsPage }>({
  brands: async ({ page }, use) => use(new BrandsPage(page))
});
export { expect } from '@playwright/test';
