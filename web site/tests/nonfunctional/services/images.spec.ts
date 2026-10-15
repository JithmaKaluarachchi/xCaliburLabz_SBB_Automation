import { test, expect } from '../../../fixtures/test.fixture';
import { services } from '../../functional/services/service-data';

for (const service of services) test(`@services @nonfunctional @images ${service.name} images load with alternative text`, async ({ page }) => {
  await page.goto(service.path, { waitUntil: 'domcontentloaded' }); const images = page.locator('main img');
  for (let i = 0; i < await images.count(); i++) await images.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(item => (item as HTMLImageElement).complete), undefined, { timeout: 15_000 });
  const invalid = await images.evaluateAll(items => items.map(item => {
    const image = item as HTMLImageElement;
    return { alt: image.getAttribute('alt'), src: image.currentSrc || image.src, width: image.naturalWidth };
  }).filter(image => image.alt === null || !image.alt.trim() || image.width === 0));
  expect(invalid).toEqual([]);
});
