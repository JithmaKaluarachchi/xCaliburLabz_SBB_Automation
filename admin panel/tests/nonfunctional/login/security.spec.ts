import { test, expect } from '../../../fixtures/login.fixture';

test.describe('Admin Login - security and privacy @nonfunctional @security', () => {
  test('LOGIN-NF-SEC-001 uses HTTPS and keeps credentials out of the URL', async ({ page, loginPage }) => {
    await loginPage.open();
    expect(page.url()).toMatch(/^https:\/\//);
    await loginPage.email.fill('privacy-check@example.invalid');
    await loginPage.password.fill('Sensitive-check-123!');
    await loginPage.submit.click();
    expect(page.url()).not.toContain('privacy-check');
    expect(page.url()).not.toContain('Sensitive-check');
  });

  test('LOGIN-NF-SEC-002 admin login is excluded from search indexing', async ({ page, loginPage }) => {
    await loginPage.open();
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots?.toLowerCase()).toContain('noindex');
    expect(robots?.toLowerCase()).toContain('nofollow');
  });
});
