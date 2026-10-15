import { expect, type Locator, type Page } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly main: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator('main');
    this.footer = page.locator('footer');
  }

  async open(): Promise<void> {
    await this.page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/\/about\/?$/);
    await expect(this.main).toBeVisible();
  }

  sectionByHeading(name: string | RegExp): Locator {
    return this.main.getByRole('heading', { name }).locator('xpath=ancestor::section[1]');
  }

  async scrollToSection(name: string | RegExp): Promise<Locator> {
    const section = this.sectionByHeading(name);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    return section;
  }
}

