import { test, expect } from '../../../fixtures/test.fixture';

test('@about-us @nonfunctional @images images load and declare alternative text', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'domcontentloaded' }); const images = page.locator('main img');
  expect(await images.count()).toBeGreaterThan(0);
  const visibleImages = page.locator('main img:visible');
  for (let i = 0; i < await visibleImages.count(); i++) await visibleImages.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].filter(item => (item as HTMLElement).offsetParent !== null)
    .every(item => (item as HTMLImageElement).complete), undefined, { timeout: 15_000 });
  const invalid = await images.evaluateAll(items => items.map(item => {
    const image = item as HTMLImageElement;
    const visible = image.offsetParent !== null;
    return { alt: image.getAttribute('alt'), src: image.currentSrc || image.src, width: image.naturalWidth, visible };
  }).filter(image => image.alt === null || (image.visible && image.width === 0)));
  expect(invalid).toEqual([]);
});
