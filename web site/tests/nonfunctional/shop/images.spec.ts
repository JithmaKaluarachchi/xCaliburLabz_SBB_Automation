import { test, expect } from '../../../fixtures/test.fixture';

test('@shop @nonfunctional @images all shop product images load and include alternative text', async ({ page }) => {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  const images = page.locator('main img'); await expect(images.first()).toBeVisible({ timeout: 20_000 });
  for (let i = 0; i < await images.count(); i++) await images.nth(i).scrollIntoViewIfNeeded();
  const invalid = await images.evaluateAll(items => items.map(item => {
    const image = item as HTMLImageElement;
    return { alt: image.getAttribute('alt'), src: image.currentSrc || image.src, width: image.naturalWidth };
  }).filter(image => image.alt === null || image.width === 0));
  expect(invalid).toEqual([]);
});
