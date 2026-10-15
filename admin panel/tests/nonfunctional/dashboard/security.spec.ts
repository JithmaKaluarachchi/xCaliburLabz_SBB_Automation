import { test, expect } from '../../../fixtures/dashboard.fixture';

test('DASH-NF-SEC-001 dashboard remains an authenticated HTTPS admin page @dashboard @nonfunctional @security', async ({ page, dashboard }) => {
  await dashboard.open();
  expect(page.url()).toMatch(/^https:\/\//);
  expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/admin');
  expect(page.url()).not.toContain('/admin/login');
});
