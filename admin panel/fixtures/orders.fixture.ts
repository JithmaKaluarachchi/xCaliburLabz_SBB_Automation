import { test as base } from '@playwright/test';
import { OrdersPage } from '../pages/orders.page';

export const test = base.extend<{ orders: OrdersPage }>({
  orders: async ({ page }, use) => use(new OrdersPage(page))
});
export { expect } from '@playwright/test';
