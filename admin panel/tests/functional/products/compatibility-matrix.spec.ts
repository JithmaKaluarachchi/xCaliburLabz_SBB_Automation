import AxeBuilder from '@axe-core/playwright';
import { productStatuses } from '../../../pages/products.page';
import { test, expect } from '../../../fixtures/products.fixture';

test.describe('Admin products compatibility matrix @products @products-matrix', () => {
  test('PROD-MATRIX-F-001 catalog, search, filters and safe actions work @functional', async ({ page, products }) => {
    await products.open();
    await expect(products.description).toBeVisible();
    const name = await products.firstProductName();
    await products.search.fill(name);
    await expect(products.row()).toContainText(name);
    await products.search.clear();
    await products.openFilter('status');
    for (const status of productStatuses) await expect(page.getByText(status, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await products.openFirstDeleteDialog();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('PROD-MATRIX-UI-001 products interface is usable on configured profile @ui', async ({ page, products }) => {
    await products.open();
    await expect(products.search).toBeVisible();
    await expect(products.newProduct).toBeVisible();
    const searchBox = await products.search.boundingBox();
    expect(searchBox).not.toBeNull();
    expect(searchBox!.height).toBeGreaterThanOrEqual(24);
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test('PROD-MATRIX-NF-001 accessibility, HTTPS and runtime quality pass @nonfunctional', async ({ page, products }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await products.open();
    const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('products-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    expect(axe.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(page.url()).toMatch(/^https:\/\//);
    expect(page.url()).not.toContain('/admin/login');
    expect(errors).toEqual([]);
  });
});
