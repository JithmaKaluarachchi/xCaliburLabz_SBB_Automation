import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly heading: Locator;
  readonly description: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly passwordToggle: Locator;
  readonly submit: Locator;
  readonly staffNotice: Locator;
  readonly notifications: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Admin Login', exact: true });
    this.description = page.getByText('Sign in to manage your store', { exact: true });
    this.email = page.getByLabel('Email', { exact: true });
    this.password = page.locator('input[name="password"]');
    this.passwordToggle = page.getByRole('button', { name: /show password|hide password/i });
    this.submit = page.getByRole('button', { name: 'Sign in', exact: true });
    this.staffNotice = page.getByText('Staff access only. Contact an administrator if you need an account.', { exact: true });
    this.notifications = page.getByRole('region', { name: /notifications/i });
  }

  async open() {
    const response = await this.page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    expect(response?.ok(), `Login page returned HTTP ${response?.status()}`).toBeTruthy();
    await expect(this.heading).toBeVisible();
    await this.page.waitForFunction(() => {
      const form = document.querySelector('form');
      return Boolean(form && Object.keys(form).some((key) => key.startsWith('__reactProps$')));
    }, undefined, { timeout: 15_000 });
  }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  async visibleFeedback(): Promise<string> {
    await this.page.waitForTimeout(500);
    return (await this.page.locator('[role="alert"], [data-sonner-toast], [aria-live]').allInnerTexts()).join(' ').trim();
  }
}
