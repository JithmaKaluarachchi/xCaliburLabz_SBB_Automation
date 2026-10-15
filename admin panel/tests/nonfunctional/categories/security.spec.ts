import { test, expect } from '../../../fixtures/categories.fixture';

test('CAT-NF-SEC-001 categories remains authenticated HTTPS admin page @categories @nonfunctional @security', async ({ page, categories }) => {
  await categories.open();
  expect(page.url()).toMatch(/^https:\/\//);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/admin/categories');
  expect(page.url()).not.toContain('/admin/login');
});
