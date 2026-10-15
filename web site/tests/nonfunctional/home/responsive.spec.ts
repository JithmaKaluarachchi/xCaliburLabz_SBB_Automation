import { test, expect } from '../../../fixtures/test.fixture';

test('@nonfunctional @responsive does not overflow the viewport horizontally', async ({ homePage, page }) => {
  await homePage.open();
  const dimensions = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
});
