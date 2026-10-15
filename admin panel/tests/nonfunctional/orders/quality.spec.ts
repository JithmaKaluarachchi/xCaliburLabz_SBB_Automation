import { test, expect } from '../../../fixtures/orders.fixture';

test('ORDER-NF-QUAL-001 list and details have no uncaught errors or failed API responses @orders @nonfunctional @quality', async ({ page, orders }, testInfo) => {
  const errors: string[] = [];
  const failedResponses: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 500) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  await orders.open();
  await orders.openFirstDetails();
  await testInfo.attach('orders-runtime-quality.json', { body: JSON.stringify({ errors, failedResponses }, null, 2), contentType: 'application/json' });
  expect(errors).toEqual([]);
  expect(failedResponses).toEqual([]);
});
