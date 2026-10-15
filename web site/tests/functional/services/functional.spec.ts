import { test, expect } from '../../../fixtures/test.fixture';
import { services } from './service-data';
import { ServicePage } from '../../../pages/service.page';

for (const service of services) {
  test.describe(`${service.name} - functional`, () => {
    test.beforeEach(async ({ page }) => new ServicePage(page).open(service));

    test(`@services @functional @content ${service.name} shows its title and description`, async ({ page }) => {
      await new ServicePage(page).expectCoreContent(service);
      await expect(page.locator('main section')).toHaveCount(3);
    });

    test(`@services @functional @navigation ${service.name} hero actions have correct destinations`, async ({ page }) => {
      const servicePage = new ServicePage(page);
      const quote = servicePage.requestQuoteLinks().first();
      const call = servicePage.main.getByRole('link', { name: 'Call Us', exact: true });
      await expect(servicePage.requestQuoteLinks()).toHaveCount(2);
      await expect(quote).toHaveAttribute('href', '/contact');
      await expect(call).toHaveAttribute('href', /^tel:\+94\s?77\s?000\s?0000$/);
      await quote.click();
      await expect(page).toHaveURL(/\/contact\/?$/);
    });

    test(`@services @functional @features ${service.name} includes every feature and benefit`, async ({ page }) => {
      const main = new ServicePage(page).main;
      for (const feature of service.features) {
        const heading = main.getByRole('heading', { level: 3, name: feature, exact: true });
        await expect(heading).toBeVisible();
        const card = heading.locator('..');
        await expect(card.locator('p')).toHaveText(/\S+/);
      }
    });

    test(`@services @functional @cta ${service.name} lower call-to-action buttons navigate correctly`, async ({ page }) => {
      const servicePage = new ServicePage(page);
      const ctaHeading = servicePage.main.getByRole('heading', { name: service.ctaHeading, exact: true });
      const ctaSection = ctaHeading.locator('..').locator('..');
      await expect(ctaHeading).toBeVisible();
      await expect(ctaSection.getByRole('link', { name: 'Request a Quote', exact: true })).toHaveAttribute('href', '/contact');
      const contact = ctaSection.getByRole('link', { name: 'Contact Us', exact: true });
      await expect(contact).toHaveAttribute('href', '/contact');
      await contact.click();
      await expect(page).toHaveURL(/\/contact\/?$/);
    });

    test(`@services @functional @footer ${service.name} footer content and links are complete`, async ({ page }) => {
      const footer = new ServicePage(page).footer;
      await expect(footer).toBeVisible();
      for (const heading of ['Our Locations', 'Call Centre', 'Social Media', 'Quick Links']) {
        await expect(footer.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      }
      for (const [name, href] of [['Home', '/'], ['About Us', '/about'], ['Contact Us', '/contact'], ['Equipments', '/shop'], ['Services', '/services']]) {
        await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
      }
      await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
      await expect(footer.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
      expect(await footer.locator('a[href^="http"]').count()).toBeGreaterThanOrEqual(5);
    });
  });
}
