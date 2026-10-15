import { test, expect } from '../../../fixtures/dashboard.fixture';

test('DASH-NF-QUAL-001 dashboard loads without uncaught page errors @dashboard @nonfunctional @quality', async ({ page, dashboard }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await dashboard.open();
  await dashboard.selectRange('7d');
  await testInfo.attach('dashboard-page-errors.json', { body: JSON.stringify(errors, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
});
