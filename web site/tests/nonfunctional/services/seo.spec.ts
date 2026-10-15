import { test, expect } from '../../../fixtures/test.fixture';
import { services } from '../../functional/services/service-data';

for (const service of services) test(`@services @nonfunctional @seo ${service.name} has metadata and semantic structure`, async ({ page }) => {
  await page.goto(service.path, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(new RegExp(service.name.replace('&', '&?'), 'i'));
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  expect(description?.trim().length ?? 0).toBeGreaterThanOrEqual(50);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${service.path}/?$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});
