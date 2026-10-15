import { test, expect } from '../../../fixtures/test.fixture';
import { ShopPage } from '../../../pages/shop.page';

test.describe('Shop listing', () => {
  test.beforeEach(async ({ page }) => new ShopPage(page).open());

  test('@shop @navigation header navigation and shop content are available', async ({ page }) => {
    for (const [name, href] of [['Home', '/'], ['Shop', '/shop'], ['About Us', '/about'], ['Contact Us', '/contact']]) {
      await expect(page.locator(`header a[href="${href}"]`).filter({ hasText: name })).toHaveCount(1);
    }
    const sections = page.locator('main, footer');
    for (let i = 0; i < await sections.count(); i++) {
      await sections.nth(i).scrollIntoViewIfNeeded();
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('@shop @search searches with real and missing product data', async ({ page }) => {
    const shop = new ShopPage(page);
    const productName = (await shop.productCards.first().locator('img').getAttribute('alt'))!;
    await shop.search.fill(productName);
    await shop.searchButton.click();
    await expect(page.getByText(productName, { exact: true }).first()).toBeVisible();

    await shop.search.fill('AUTOMATION-NO-SUCH-PRODUCT-98765');
    await shop.searchButton.click();
    await expect(shop.productCards).toHaveCount(0);
  });

  test('@shop @sort exercises every available sort option', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.sortButton.click();
    const options = page.getByRole('option').or(page.getByRole('menuitem')).or(page.locator('[role="listbox"] button'));
    await expect(options.first()).toBeVisible();
    const labels = await options.allTextContents();
    expect(labels.length).toBeGreaterThanOrEqual(3);
    for (const label of labels) {
      // Start each choice from a fresh listing because the Radix menu is
      // re-created when the selected sorting state changes.
      await shop.open();
      await shop.sortButton.click();
      const option = page.getByRole('option', { name: label.trim(), exact: true });
      await expect(option).toBeVisible();
      await option.click({ force: true });
      await expect(shop.productCards.first()).toBeVisible();
    }
  });

  test('@shop @filters category, brand, and price controls filter safely', async ({ page }) => {
    const shop = new ShopPage(page);
    const initial = await shop.productCards.count();
    const gases = page.getByText('Gases', { exact: true }).locator('..').getByRole('checkbox');
    const yamato = page.getByText('Yamato', { exact: true }).locator('..').getByRole('checkbox');
    await gases.click();
    await expect(gases).toHaveAttribute('aria-checked', 'true');
    await expect(shop.productCards.first()).toBeVisible();
    await yamato.click();
    await expect(yamato).toHaveAttribute('aria-checked', 'true');
    expect(await shop.productCards.count()).toBeLessThanOrEqual(initial);
    await gases.click();
    await yamato.click();

    const sliders = page.getByRole('slider');
    await expect(sliders).toHaveCount(2);
    await sliders.first().press('ArrowRight');
    await sliders.last().press('ArrowLeft');
    await expect(page.getByText('Filters applied', { exact: true })).toBeVisible();
  });

  test('@shop @products every visible product image links to a valid detail route', async ({ page, request, baseURL }) => {
    const shop = new ShopPage(page);
    const count = await shop.productCards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const link = shop.productCards.nth(i);
      const href = (await link.getAttribute('href'))!;
      await expect(link.locator('img')).toHaveAttribute('alt', /\S+/);
      const response = await request.get(new URL(href, baseURL).toString(), { failOnStatusCode: false });
      expect(response.status(), href).toBeLessThan(400);
    }
    const href = await shop.productCards.first().getAttribute('href');
    await shop.productCards.first().click();
    await expect(page).toHaveURL(new RegExp(`${href}/?$`));
  });
});
