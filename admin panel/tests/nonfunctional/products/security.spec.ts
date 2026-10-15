import { test, expect } from '../../../fixtures/products.fixture';

test('PROD-NF-SEC-001 products remains authenticated HTTPS admin page @products @nonfunctional @security', async ({ page, products }) => {
  await products.open();
  expect(page.url()).toMatch(/^https:\/\//);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/admin/products');
  expect(page.url()).not.toContain('/admin/login');
});
