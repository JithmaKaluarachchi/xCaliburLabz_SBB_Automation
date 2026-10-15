import { test, expect } from '../../../fixtures/orders.fixture';

test('ORDER-NF-PERF-001 list and details load within ten seconds @orders @nonfunctional @performance', async ({ page, orders }, testInfo) => {
  const listStart = Date.now();
  await orders.open();
  const listMs = Date.now() - listStart;
  const detailStart = Date.now();
  await orders.openFirstDetails();
  const detailsMs = Date.now() - detailStart;
  await testInfo.attach('orders-load-times.json', { body: JSON.stringify({ listMs, detailsMs }, null, 2), contentType: 'application/json' });
  expect(listMs).toBeLessThan(10_000);
  expect(detailsMs).toBeLessThan(10_000);
});
