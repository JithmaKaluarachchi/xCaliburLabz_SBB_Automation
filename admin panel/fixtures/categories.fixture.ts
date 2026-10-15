import { test as base } from '@playwright/test';
import { CategoriesPage } from '../pages/categories.page';

export const test = base.extend<{ categories: CategoriesPage }>({
  categories: async ({ page }, use) => use(new CategoriesPage(page))
});
export { expect } from '@playwright/test';
