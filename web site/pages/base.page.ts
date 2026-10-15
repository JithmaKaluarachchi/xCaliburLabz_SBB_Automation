import { expect, type Locator, type Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly main: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator('main').or(page.locator('body'));
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/^https?:\/\//);
    await expect(this.main.first()).toBeVisible();
    await expect(this.page.locator('body')).not.toHaveText(/^\s*$/);
  }
}
