import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly header: Locator;
  readonly footer: Locator;
  readonly heading: Locator;
  readonly navigation: Locator;
  readonly logoLink: Locator;
  readonly cartLink: Locator;
  readonly callLink: Locator;
  readonly menuButton: Locator;
  readonly mobileMenu: Locator;

  constructor(page: Page) {
    super(page);
    this.header = page.locator('header');
    this.footer = page.locator('footer');
    this.heading = page.getByRole('heading').first();
    this.navigation = this.header.getByRole('navigation').first();
    this.logoLink = this.header.getByRole('link', { name: 'SBB Oxygen House home' });
    this.cartLink = this.header.getByRole('link', { name: /Cart,/ });
    this.callLink = this.header.getByRole('link', { name: 'Call us' });
    this.menuButton = this.header.getByRole('button', { name: /menu/i });
    this.mobileMenu = page.locator('#mobile-menu');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async openMobileMenu(): Promise<void> {
    await this.menuButton.click();
  }
}
