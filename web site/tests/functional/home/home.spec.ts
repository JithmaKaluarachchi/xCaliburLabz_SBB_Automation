import { test, expect } from '../../../fixtures/test.fixture';

test.describe('Home page', () => {
  test('@smoke @functional loads successfully with meaningful content', async ({ homePage, page }) => {
    const responsePromise = page.waitForResponse(
      (response) => response.request().isNavigationRequest() && response.frame() === page.mainFrame()
    );

    await homePage.open();
    const response = await responsePromise;

    expect(response.status(), 'The document request should succeed').toBeLessThan(400);
    await homePage.expectLoaded();
    await expect(page).toHaveTitle(/\S+/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('@functional has no duplicate element IDs', async ({ homePage, page }) => {
    await homePage.open();
    const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
      const ids = elements.map((element) => element.id).filter(Boolean);
      return ids.filter((id, index) => ids.indexOf(id) !== index);
    });
    expect([...new Set(duplicateIds)]).toEqual([]);
  });
});
