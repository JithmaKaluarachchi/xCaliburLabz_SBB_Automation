import { test, expect } from '../../../fixtures/test.fixture';

test('@nonfunctional @security uses HTTPS and records baseline security headers', async ({ request, baseURL }, testInfo) => {
  expect(baseURL).toMatch(/^https:\/\//);
  const response = await request.get(baseURL!, { failOnStatusCode: false });
  expect(response.status()).toBeLessThan(400);

  const headers = response.headers();
  const observed = {
    'strict-transport-security': headers['strict-transport-security'] ?? 'MISSING',
    'content-security-policy': headers['content-security-policy'] ?? 'MISSING',
    'x-content-type-options': headers['x-content-type-options'] ?? 'MISSING',
    'referrer-policy': headers['referrer-policy'] ?? 'MISSING'
  };
  await testInfo.attach('security-headers', {
    body: JSON.stringify(observed, null, 2),
    contentType: 'application/json'
  });
});
