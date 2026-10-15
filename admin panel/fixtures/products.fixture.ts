import { test as base } from '@playwright/test';
import { ProductsPage } from '../pages/products.page';

export const test = base.extend<{ products: ProductsPage }>({
  products: async ({ page }, use) => use(new ProductsPage(page))
});
export { expect } from '@playwright/test';
