import { test, expect } from '../../../fixtures/test.fixture';
import { services } from '../../functional/services/service-data';

for (const service of services) test(`@services @nonfunctional @responsive ${service.name} has no horizontal overflow`, async ({ page }) => {
  await page.goto(service.path, { waitUntil: 'domcontentloaded' });
  const size = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
});
