import AxeBuilder from '@axe-core/playwright';
import { categoryTableHeaders } from '../../../pages/categories.page';
import { test, expect } from '../../../fixtures/categories.fixture';

test.describe('Admin categories compatibility matrix @categories @categories-matrix', () => {
  test('CAT-MATRIX-F-001 list, search, create/edit/delete dialogs work safely @functional', async ({ page, categories }) => {
    await categories.open();
    for (const header of categoryTableHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
    const name = await categories.firstCategoryName();
    await categories.search.fill(name);
    await expect(categories.row()).toContainText(name);
    await categories.openFirstEdit();
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue(name);
    await page.keyboard.press('Escape');
    await categories.openFirstDelete();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  });

  test('CAT-MATRIX-UI-001 categories fits the configured profile @ui', async ({ page, categories }) => {
    await categories.open();
    await expect(categories.search).toBeVisible();
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
  });

  test('CAT-MATRIX-NF-001 accessibility, HTTPS and runtime quality pass @nonfunctional', async ({ page, categories }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await categories.open();
    const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    await testInfo.attach('categories-axe.json', { body: JSON.stringify(axe.violations, null, 2), contentType: 'application/json' });
    expect(axe.violations.filter(v => v.impact === 'critical')).toEqual([]);
    expect(page.url()).toMatch(/^https:\/\//);
    expect(errors).toEqual([]);
  });
});
