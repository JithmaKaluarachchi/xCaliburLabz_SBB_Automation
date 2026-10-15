import { test, expect } from '../../fixtures/test.fixture';

test('@visual homepage visual regression', async ({ homePage, page }) => {
  await homePage.open();
  await page.waitForLoadState('load');
  const images = page.locator('img');
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
  }
  await expect.poll(async () => images.evaluateAll((items) => items
    .filter((item) => !(item as HTMLImageElement).complete || (item as HTMLImageElement).naturalWidth === 0).length), {
    timeout: 20_000
  }).toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.02,
    timeout: 20_000
  });
});
