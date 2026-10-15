import { test, expect } from '../../../fixtures/login.fixture';

test.describe('Admin Login - functional @functional', () => {
  test.beforeEach(async ({ loginPage }) => loginPage.open());

  test('LOGIN-F-001 displays the correct title, description and controls @smoke', async ({ page, loginPage }) => {
    await expect(page).toHaveTitle('SBB Oxygen House | Admin Sign In');
    await expect(loginPage.description).toBeVisible();
    await expect(loginPage.email).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.submit).toBeEnabled();
    await expect(loginPage.staffNotice).toBeVisible();
  });

  test('LOGIN-F-002 email and password fields use correct input semantics', async ({ loginPage }) => {
    await expect(loginPage.email).toHaveAttribute('type', 'email');
    await expect(loginPage.email).toHaveAttribute('autocomplete', 'username');
    await expect(loginPage.password).toHaveAttribute('type', 'password');
    await expect(loginPage.password).toHaveAttribute('autocomplete', 'current-password');
  });

  test('LOGIN-F-003 password visibility control shows and hides the value', async ({ loginPage }) => {
    await loginPage.password.fill('Example-password-123');
    await loginPage.passwordToggle.click();
    await expect(loginPage.password).toHaveAttribute('type', 'text');
    await expect(loginPage.passwordToggle).toHaveAccessibleName(/hide password/i);
    await loginPage.passwordToggle.click();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('LOGIN-F-004 empty form is rejected and remains on login page', async ({ page, loginPage }) => {
    await loginPage.submit.click();
    await expect(page).toHaveURL(/\/admin\/login\/?$/);
    const invalidCount = await page.locator(':invalid').count();
    const feedback = await loginPage.visibleFeedback();
    expect(invalidCount > 0 || feedback.length > 0, 'Expected browser or application validation feedback').toBeTruthy();
  });

  test('LOGIN-F-005 invalid credentials are rejected without exposing the password', async ({ page, loginPage }) => {
    const fakePassword = 'Invalid-password-987!';
    await loginPage.signIn('invalid-user@example.invalid', fakePassword);
    await expect(page).toHaveURL(/\/admin\/login\/?$/);
    const feedback = await loginPage.visibleFeedback();
    expect(feedback.length, 'Expected an invalid-credentials message').toBeGreaterThan(0);
    expect((await page.locator('body').innerText())).not.toContain(fakePassword);
  });

  test('LOGIN-F-006 Enter key submits the completed form', async ({ page, loginPage }) => {
    await loginPage.email.fill('invalid-user@example.invalid');
    await loginPage.password.fill('Invalid-password-987!');
    await loginPage.password.press('Enter');
    await expect(page).toHaveURL(/\/admin\/login\/?$/);
    expect((await loginPage.visibleFeedback()).length).toBeGreaterThan(0);
  });

  test('LOGIN-F-007 authorised login navigates to the admin dashboard', async ({ page, loginPage }, testInfo) => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    test.skip(!username || !password, 'Set ADMIN_USERNAME and ADMIN_PASSWORD to run the authorised-login check.');
    await loginPage.signIn(username!, password!);
    await expect(page).toHaveURL('https://sbb.caliburlabz.com/admin', { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/admin\/login\/?$/);
    await testInfo.attach('post-login-url.txt', { body: page.url(), contentType: 'text/plain' });
  });
});
