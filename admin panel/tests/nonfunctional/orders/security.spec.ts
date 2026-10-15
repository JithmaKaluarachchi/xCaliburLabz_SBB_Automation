import { test, expect } from '../../../fixtures/orders.fixture';

test('ORDER-NF-SEC-001 order pages remain authenticated HTTPS admin routes @orders @nonfunctional @security', async ({ page, orders }) => {
  await orders.open();
  expect(page.url()).toMatch(/^https:\/\//);
  expect(page.url()).not.toContain('/admin/login');
  await orders.openFirstDetails();
  expect(new URL(page.url()).pathname).toMatch(/^\/admin\/orders\/[^/]+\/?$/);
  expect(page.url()).not.toContain('/admin/login');
});
