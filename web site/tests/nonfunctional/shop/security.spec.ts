import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @security shop uses HTTPS and records baseline security headers', async ({ request, baseURL }, testInfo) => {
  const url = new URL('/shop', baseURL).toString();
  expect(url).toMatch(/^https:\/\//);
  const response = await request.get(url, { failOnStatusCode: false });
  expect(response.status()).toBeLessThan(400);
  const headers = response.headers();
  await testInfo.attach('shop-security-headers', { body: JSON.stringify({
    'strict-transport-security': headers['strict-transport-security'] ?? 'MISSING',
    'content-security-policy': headers['content-security-policy'] ?? 'MISSING',
    'x-content-type-options': headers['x-content-type-options'] ?? 'MISSING',
    'referrer-policy': headers['referrer-policy'] ?? 'MISSING'
  }, null, 2), contentType: 'application/json' });
});
