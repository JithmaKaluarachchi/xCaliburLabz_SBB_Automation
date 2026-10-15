import { expect, type Locator, type Page } from '@playwright/test';

export class ContactPage {
  readonly page: Page;
  readonly main: Locator;
  readonly form: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator('main');
    this.form = page.locator('form');
    this.footer = page.locator('footer');
  }

  async open(): Promise<void> {
    await this.page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/\/contact\/?$/);
    await expect(this.page.getByRole('button', { name: /Send message/i })).toBeVisible();
    await this.page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => undefined);
    await expect(this.page.getByRole('tab', { name: 'Main Branch', exact: true })).toHaveAttribute('data-state', 'active');
  }

  async fillRequired(name: string, email: string, message: string): Promise<void> {
    await this.page.getByLabel('Name', { exact: true }).fill(name);
    await this.page.getByLabel('Email', { exact: true }).fill(email);
    await this.page.getByLabel('Message', { exact: true }).fill(message);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: /Send message/i }).click();
  }

  section(name: string): Locator {
    return this.main.getByRole('heading', { name, exact: true }).locator('xpath=ancestor::section[1]');
  }
}
