import AxeBuilder from '@axe-core/playwright';
import { brandTableHeaders } from '../../../pages/brands.page';
import { test, expect } from '../../../fixtures/brands.fixture';

test.describe('Admin brands compatibility matrix @brands @brands-matrix', () => {
  test('BRAND-MATRIX-F-001 list, search, create/edit/delete dialogs work safely @functional', async ({ page, brands }) => {
    await brands.open();
    for (const header of brandTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    const name = await brands.firstBrandName();
    await brands.search.fill(name);
    await expect(brands.rowByText(name)).toHaveCount(1);
    await brands.openEditFor(name);
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name);
    await page.keyboard.press('Escape');
    await brands.openDeleteFor(name);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('BRAND-MATRIX-UI-001 brands fits the configured profile @ui', async ({ page, brands }) => {
    await brands.open();
    await expect(brands.search).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test('BRAND-MATRIX-NF-001 accessibility, HTTPS and runtime quality pass @nonfunctional', async ({ page, brands }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await brands.open();
    const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('brands-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    expect(axe.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(page.url()).toMatch(/^https:\/\//);
    expect(errors).toEqual([]);
  });
});
