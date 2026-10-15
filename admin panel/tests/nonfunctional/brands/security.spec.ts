import { test, expect } from '../../../fixtures/brands.fixture';

test('BRAND-NF-SEC-001 brands remains authenticated HTTPS admin page @brands @nonfunctional @security', async ({ page, brands }) => {
  await brands.open();
  expect(page.url()).toMatch(/^https:\/\//);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/admin/brands');
  expect(page.url()).not.toContain('/admin/login');
});
