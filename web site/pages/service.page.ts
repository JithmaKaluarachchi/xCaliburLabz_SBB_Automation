import { expect, type Locator, type Page } from '@playwright/test';

type ServicePageDefinition = {
  name: string;
  path: string;
  description: RegExp;
  ctaHeading: string;
};

export class ServicePage {
  readonly page: Page;
  readonly main: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.main = page.locator('main');
    this.footer = page.locator('footer');
  }

  async open(service: ServicePageDefinition): Promise<void> {
    await this.page.goto(service.path, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(new RegExp(`${service.path}/?$`));
    await expect(this.main).toBeVisible();
  }

  requestQuoteLinks(): Locator {
    return this.main.getByRole('link', { name: 'Request a Quote', exact: true });
  }

  async expectCoreContent(service: ServicePageDefinition): Promise<void> {
    await expect(this.main.getByRole('heading', { level: 1, name: service.name, exact: true })).toBeVisible();
    await expect(this.main.getByText(service.description).first()).toBeVisible();
    await expect(this.main.getByRole('heading', { level: 2, name: 'Key Features & Benefits', exact: true })).toBeVisible();
    await expect(this.main.getByRole('heading', { level: 2, name: service.ctaHeading, exact: true })).toBeVisible();
  }
}
