import { test, expect } from '../../../fixtures/test.fixture';
import { ShopPage } from '../../../pages/shop.page';

async function reachCheckout(page: import('@playwright/test').Page) {
  const shop = new ShopPage(page); await shop.open(); const item = await shop.addFirstProduct();
  await shop.cartLink.click(); await page.getByRole('link', { name: /Proceed to checkout/i }).click();
  await expect(page).toHaveURL(/\/checkout\/?$/); return item;
}

const validCustomer = {
  firstName: 'Automation',
  lastName: 'Tester',
  email: 'automation@example.com',
  phone: '0771234567',
  line1: '123 Test Street',
  line2: 'Suite 4',
  city: 'Colombo',
  postalCode: '01000',
  customerNote: 'Automated validation test - do not fulfil'
};

async function fillCustomerFields(page: import('@playwright/test').Page, overrides: Record<string, string> = {}) {
  const values = { ...validCustomer, ...overrides };
  for (const [name, value] of Object.entries(values)) {
    await page.locator(`[name="${name}"]`).fill(value);
  }
}

async function selectAddressRegion(page: import('@playwright/test').Page) {
  await page.locator('main button').filter({ hasText: 'Select province' }).click();
  await page.getByText('Western', { exact: true }).last().click();
  const district = page.locator('main button').filter({ hasText: /Select district/i });
  await expect(district).toBeEnabled();
  await district.click();
  const option = page.getByRole('option').first();
  await expect(option).toBeVisible();
  await option.click();
}

async function expectCheckoutBlocked(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Place order/i }).click();
  await expect(page).toHaveURL(/\/checkout\/?$/);
  await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
}

test.describe('Checkout', () => {
  test('@shop @checkout shows correct item, totals and required form validation', async ({ page }) => {
    const item = await reachCheckout(page);
    await expect(page.getByRole('heading', { name: 'Checkout', exact: true })).toBeVisible();
    await expect(page.getByText(/Enter your contact and delivery details/)).toBeVisible();
    await expect(page.getByText(new RegExp(`${item.name} × 1`))).toBeVisible();
    const main = page.locator('main');
    await expect(main).toContainText(`LKR ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    await page.getByRole('button', { name: /Place order/i }).click();
    await expect(page).toHaveURL(/\/checkout\/?$/);
    await expect(main).toContainText(/required|enter|select/i);
  });

  test('@shop @checkout accepts test customer data and dependent province/district selections', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page);
    await selectAddressRegion(page);
    await expect(page.locator('[name="email"]')).toHaveValue(validCustomer.email);
  });

  test('@shop @coupon invalid optional coupon does not change checkout totals', async ({ page }) => {
    await reachCheckout(page);
    const code = 'AUTOMATION-NOT-VALID-98765';
    const totalBefore = (await page.locator('main').innerText()).match(/Total\s*LKR\s*([\d,]+\.\d{2})/i)?.[1];
    expect(totalBefore).toBeTruthy();
    await page.getByRole('textbox', { name: 'Coupon code' }).fill(code);
    await page.getByRole('button', { name: 'Apply' }).click();
    const invalidAlert = page.getByRole('alert').filter({ hasText: /invalid|not found/i })
      .or(page.getByText(/invalid coupon|coupon.*not found/i));
    if (await invalidAlert.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(invalidAlert.first()).toBeVisible();
    }
    const totalAfter = (await page.locator('main').innerText()).match(/Total\s*LKR\s*([\d,]+\.\d{2})/i)?.[1];
    expect(totalAfter).toBe(totalBefore);
    await expect(page.getByRole('button', { name: /Place order/i })).toBeEnabled();
  });

  test('@shop @checkout coupon is optional and checkout remains available without one', async ({ page }) => {
    await reachCheckout(page);
    await expect(page.getByRole('textbox', { name: 'Coupon code' })).toHaveValue('');
    await expect(page.getByRole('button', { name: /Place order/i })).toBeEnabled();
  });

  test('@shop @checkout required fields reject invalid formats without creating an order', async ({ page }) => {
    await reachCheckout(page);
    await page.locator('[name="firstName"]').fill('12345');
    await page.locator('[name="lastName"]').fill('!@#$');
    await page.locator('[name="email"]').fill('not-an-email');
    await page.locator('[name="phone"]').fill('abc');
    await page.locator('[name="line1"]').fill('');
    await page.locator('[name="city"]').fill('');
    await page.getByRole('button', { name: /Place order/i }).click();
    await expect(page).toHaveURL(/\/checkout\/?$/);
  });

  for (const field of [
    { name: 'firstName', label: 'First name' },
    { name: 'lastName', label: 'Last name' },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
    { name: 'line1', label: 'Address line 1' },
    { name: 'city', label: 'City' }
  ]) {
    test(`@shop @validation ${field.label} is required`, async ({ page }) => {
      await reachCheckout(page);
      await fillCustomerFields(page, { [field.name]: '' });
      await selectAddressRegion(page);
      await expectCheckoutBlocked(page);
      const input = page.locator(`[name="${field.name}"]`);
      await expect(input).toHaveValue('');
      const invalid = await input.getAttribute('aria-invalid');
      const nearbyError = input.locator('xpath=..').getByText(/required|enter|valid/i);
      expect(invalid === 'true' || await nearbyError.count() > 0, `${field.label} should expose a validation error`).toBeTruthy();
    });
  }

  test('@shop @validation whitespace-only required values are rejected', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page, { firstName: '   ', lastName: '   ', line1: '   ', city: '   ' });
    await selectAddressRegion(page);
    await expectCheckoutBlocked(page);
    await expect(page.locator('main')).toContainText(/required|enter|valid/i);
  });

  test('@shop @validation email format validation rejects malformed addresses', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page, { email: 'not-an-email-address' });
    await selectAddressRegion(page);
    await expectCheckoutBlocked(page);
    const email = page.locator('[name="email"]');
    const nativeValid = await email.evaluate((input: HTMLInputElement) => input.validity.valid);
    const ariaInvalid = await email.getAttribute('aria-invalid');
    expect(!nativeValid || ariaInvalid === 'true').toBeTruthy();
  });

  test('@shop @validation phone validation rejects alphabetic and too-short values', async ({ page }) => {
    for (const phone of ['abc-phone', '123']) {
      await reachCheckout(page);
      await fillCustomerFields(page, { phone });
      await selectAddressRegion(page);
      await expectCheckoutBlocked(page);
      await expect(page.locator('[name="phone"]')).toHaveValue(phone);
      await page.context().clearCookies();
    }
  });

  test('@shop @validation district remains disabled until a province is selected', async ({ page }) => {
    await reachCheckout(page);
    const district = page.locator('main button').filter({ hasText: /Select a province first/i });
    await expect(district).toBeDisabled();
    await page.locator('main button').filter({ hasText: 'Select province' }).click();
    await page.getByText('Western', { exact: true }).last().click();
    await expect(page.locator('main button').filter({ hasText: /Select district/i })).toBeEnabled();
  });

  test('@shop @validation province and district are required for delivery', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page);
    await expectCheckoutBlocked(page);
    await expect(page.locator('main')).toContainText(/province|required|select/i);
  });

  test('@shop @validation optional fields accept empty values', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page, { line2: '', postalCode: '', customerNote: '' });
    await selectAddressRegion(page);
    await expect(page.locator('[name="line2"]')).toHaveValue('');
    await expect(page.locator('[name="postalCode"]')).toHaveValue('');
    await expect(page.locator('[name="customerNote"]')).toHaveValue('');
    // Keep email deliberately invalid before testing Place Order so no real order can be created.
    await page.locator('[name="email"]').fill('invalid-email');
    await expectCheckoutBlocked(page);
  });

  test('@shop @validation optional fields accept representative test data', async ({ page }) => {
    await reachCheckout(page);
    await fillCustomerFields(page);
    await expect(page.locator('[name="line2"]')).toHaveValue(validCustomer.line2);
    await expect(page.locator('[name="postalCode"]')).toHaveValue(validCustomer.postalCode);
    await expect(page.locator('[name="customerNote"]')).toHaveValue(validCustomer.customerNote);
  });
});
