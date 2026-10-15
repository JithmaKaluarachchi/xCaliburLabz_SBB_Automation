import { test, expect } from '../../../fixtures/brands.fixture';
import { brandValidationData } from '../../test-data/brands.data';

test.describe('Admin brands - form validations @brands @functional @validation', () => {
  test.beforeEach(async ({ brands }) => {
    await brands.open();
    await brands.openNewModal();
  });

  test('BRAND-VAL-001 rejects an empty required name', async ({ page }) => {
    await page.getByLabel('Name', { exact: true }).fill(brandValidationData.emptyName);
    await page.getByRole('button', { name: /create brand/i }).click();

    await expect(page.getByText('Name is required', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Name', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('heading', { name: 'New brand', exact: true })).toBeVisible();
  });

  test('BRAND-VAL-002 identifies malformed website test data as invalid when URL validation is configured', async ({ page }) => {
    const website = page.getByLabel('Website', { exact: true });
    await website.fill(brandValidationData.invalidWebsite);

    const inputType = await website.getAttribute('type');
    expect(inputType, 'Website field uses browser URL validation').toBe('url');
    expect(await website.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(false);
  });

  test('BRAND-VAL-003 accepts a valid HTTPS website value', async ({ page }) => {
    const website = page.getByLabel('Website', { exact: true });
    await website.fill(brandValidationData.validWebsite);

    expect(await website.evaluate((input: HTMLInputElement) => input.checkValidity())).toBe(true);
  });

  test('BRAND-VAL-004 accepts boundary description data without losing its value', async ({ page }) => {
    const description = page.getByLabel('Description', { exact: true });
    await description.fill(brandValidationData.longDescription);
    await expect(description).toHaveValue(brandValidationData.longDescription);
  });

  test('BRAND-VAL-005 closes an unfinished form without creating test data', async ({ page, brands }) => {
    const cancelledName = `AUTO Cancelled Brand ${Date.now()}`;
    await page.getByLabel('Name', { exact: true }).fill(cancelledName);
    await page.keyboard.press('Escape');

    await expect(page.getByRole('heading', { name: 'New brand', exact: true })).toBeHidden();
    await expect(brands.rowByText(cancelledName)).toHaveCount(0);
  });
});
