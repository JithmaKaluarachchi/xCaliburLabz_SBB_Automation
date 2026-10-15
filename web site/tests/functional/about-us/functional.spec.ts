import { test, expect } from '../../../fixtures/test.fixture';
import { AboutPage } from '../../../pages/about.page';

test.describe('About Us - functional', () => {
  test.beforeEach(async ({ page }) => new AboutPage(page).open());

  test('@about-us @functional @content shows the page title and business description', async ({ page }) => {
    const about = new AboutPage(page);
    await expect(about.main.getByRole('heading', { level: 1, name: 'About SBB Industrial Trading', exact: true })).toBeVisible();
    await expect(about.main.getByText(/trusted supplier of industrial, medical and specialty gases/i)).toBeVisible();
  });

  test('@about-us @functional @story Our Story content and buttons navigate correctly', async ({ page }) => {
    const about = new AboutPage(page);
    const section = await about.scrollToSection('Built on trust, safety and service');
    await expect(section.locator('p')).toHaveCount(2);
    await expect(section.getByText(/committed to delivering high quality industrial and medical gas solutions/i)).toBeVisible();
    await expect(section.getByRole('link', { name: 'Browse Products', exact: true })).toHaveAttribute('href', '/shop');
    const services = section.getByRole('link', { name: 'Our Services', exact: true });
    await expect(services).toHaveAttribute('href', '/services');
    await services.click();
    await expect(page).toHaveURL(/\/services\/?$/);
  });

  test('@about-us @functional @vision-mission Our Vision and Our Mission are separate complete sections', async ({ page }) => {
    const about = new AboutPage(page);
    const visionHeading = about.main.getByRole('heading', { name: 'Our Vision', exact: true });
    const missionHeading = about.main.getByRole('heading', { name: 'Our Mission', exact: true });
    const vision = visionHeading.locator('xpath=ancestor::article[1]');
    const mission = missionHeading.locator('xpath=ancestor::article[1]');
    await vision.scrollIntoViewIfNeeded(); await expect(vision).toBeVisible();
    await expect(vision.getByText(/Sri Lanka's most trusted and innovative provider/i)).toBeVisible();
    await mission.scrollIntoViewIfNeeded(); await expect(mission).toBeVisible();
    await expect(mission.getByText(/customer-focused approach while building long-term partnerships/i)).toBeVisible();
    await expect(vision.getByRole('heading', { name: 'Our Mission', exact: true })).toHaveCount(0);
    await expect(mission.getByRole('heading', { name: 'Our Vision', exact: true })).toHaveCount(0);
  });

  test('@about-us @functional @values Our Values contains every value and description', async ({ page }) => {
    const section = await new AboutPage(page).scrollToSection('Our Values');
    for (const value of ['Safety first', 'Quality assured', 'Reliability', 'Expert support']) {
      const heading = section.getByRole('heading', { level: 3, name: value, exact: true });
      await expect(heading).toBeVisible();
      await expect(heading.locator('..').locator('p')).toHaveText(/\S+/);
    }
  });

  test('@about-us @functional @why-choose-us Why Choose Us contains every reason and description', async ({ page }) => {
    const section = await new AboutPage(page).scrollToSection('A partner you can rely on');
    for (const reason of ['Certified & Safe', 'Timely Delivery', 'Island-wide Supply', 'Expert Guidance']) {
      const heading = section.getByRole('heading', { level: 3, name: reason, exact: true });
      await expect(heading).toBeVisible();
      await expect(heading.locator('..').locator('p')).toHaveText(/\S+/);
    }
  });

  test(`@about-us @functional @cta Let's build a lasting partnership actions are correct`, async ({ page }) => {
    const section = await new AboutPage(page).scrollToSection("Let's build a lasting partnership");
    const contact = section.getByRole('link', { name: 'Contact Us', exact: true });
    await expect(contact).toHaveAttribute('href', '/contact');
    await expect(section.getByRole('link', { name: 'Call Us', exact: true })).toHaveAttribute('href', /^tel:\+94\s?77\s?000\s?0000$/);
    await contact.click();
    await expect(page).toHaveURL(/\/contact\/?$/);
  });

  test('@about-us @functional @footer footer content and links are complete', async ({ page }) => {
    const footer = new AboutPage(page).footer; await footer.scrollIntoViewIfNeeded(); await expect(footer).toBeVisible();
    for (const heading of ['Our Locations', 'Call Centre', 'Social Media', 'Quick Links']) await expect(footer.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    for (const [name, href] of [['Home', '/'], ['About Us', '/about'], ['Contact Us', '/contact'], ['Equipments', '/shop'], ['Services', '/services']]) {
      await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    }
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(footer.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
    expect(await footer.locator('a[href^="http"]').count()).toBeGreaterThanOrEqual(5);
  });
});
