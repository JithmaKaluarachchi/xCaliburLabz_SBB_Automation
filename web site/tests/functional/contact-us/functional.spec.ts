import { test, expect } from '../../../fixtures/test.fixture';
import { ContactPage } from '../../../pages/contact.page';

test.describe('Contact Us - functional', () => {
  test.beforeEach(async ({ page }) => new ContactPage(page).open());

  test('@contact-us @functional @content shows the page title and description', async ({ page }) => {
    const contact = new ContactPage(page);
    await expect(contact.main.getByRole('heading', { level: 1, name: 'Contact Us', exact: true })).toBeVisible();
    await expect(contact.main.getByText(/We're here to help.*sales, rentals, servicing or 24\/7 emergency support/i)).toBeVisible();
  });

  test('@contact-us @functional @validation required Name, Email and Message fields show correct errors', async ({ page }) => {
    const contact = new ContactPage(page); await contact.submit();
    await expect(contact.form.getByText('Please enter your name', { exact: true })).toBeVisible();
    await expect(contact.form.getByText('Enter a valid email', { exact: true })).toBeVisible();
    await expect(contact.form.getByText('Please enter a message (at least 10 characters)', { exact: true })).toBeVisible();
    for (const name of ['name', 'email', 'message']) await expect(contact.form.locator(`[name="${name}"]`)).toHaveAttribute('aria-invalid', 'true');
  });

  test('@contact-us @functional @validation Email rejects malformed addresses', async ({ page }) => {
    const contact = new ContactPage(page); await contact.fillRequired('Automation QA', 'invalid-email', 'This is a valid automation test message.');
    await contact.submit();
    const email = page.getByLabel('Email', { exact: true });
    expect(await email.evaluate((input: HTMLInputElement) => input.checkValidity())).toBeFalsy();
    expect(await email.evaluate((input: HTMLInputElement) => input.validationMessage)).toMatch(/@|email/i);
  });

  test('@contact-us @functional @validation optional Phone and Subject accept empty and representative values', async ({ page }) => {
    const phone = page.getByLabel('Phone (optional)', { exact: true }); const subject = page.getByLabel('Subject (optional)', { exact: true });
    await expect(phone).toHaveValue(''); await expect(subject).toHaveValue('');
    await phone.fill('+94 76 555 5515'); await subject.fill('Automation enquiry');
    expect(await phone.evaluate((input: HTMLInputElement) => input.checkValidity())).toBeTruthy();
    expect(await subject.evaluate((input: HTMLInputElement) => input.checkValidity())).toBeTruthy();
    await expect(phone).toHaveValue('+94 76 555 5515'); await expect(subject).toHaveValue('Automation enquiry');
  });

  test('@contact-us @functional @submission sends the form and displays the success notification', async ({ page }, testInfo) => {
    const contact = new ContactPage(page);
    await contact.fillRequired(`Playwright QA ${testInfo.project.name}`, 'automation@example.com', `Automated Contact Us test from ${testInfo.project.name}. Please ignore this message.`);
    await page.getByLabel('Phone (optional)', { exact: true }).fill('+94 76 555 5515');
    await page.getByLabel('Subject (optional)', { exact: true }).fill(`Automated test - ${testInfo.project.name}`);
    await contact.submit();
    await expect(page.locator('[role="alert"], [data-sonner-toast]').filter({ hasText: /Thanks!.*get back to you soon/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  });

  test('@contact-us @functional @details Contact details and navigation destinations are correct', async ({ page }) => {
    const section = new ContactPage(page).section('Contact details'); await section.scrollIntoViewIfNeeded(); await expect(section).toBeVisible();
    await expect(section.getByRole('link', { name: /Call us/i })).toHaveAttribute('href', 'tel:+94765535515');
    await expect(section.getByRole('link', { name: /WhatsApp/i })).toHaveAttribute('href', 'https://wa.me/94765535515');
    await expect(section.getByRole('link', { name: /Email/i })).toHaveAttribute('href', 'mailto:sbboxygen@gmail.com');
    await expect(section.getByText(/No\. 123, Galle Road, Colombo 03, Sri Lanka/i)).toBeVisible();
    await expect(section.getByText(/Mon.*Sat: 8:30am.*6:00pm/i)).toBeVisible();
    expect(await section.locator('a[href^="http"]').count()).toBeGreaterThanOrEqual(3);
  });

  test('@contact-us @functional @maps every branch tab selects the correct displayed map', async ({ page }) => {
    const branches = ['Main Branch', 'Wallampitiya Branch', 'Wattala Branch', 'Panchikawatte Branch'];
    const mapSources = new Set<string>();
    for (const branch of branches) {
      const tab = page.getByRole('tab', { name: branch, exact: true }); await tab.scrollIntoViewIfNeeded(); await tab.click();
      await expect(tab).toHaveAttribute('data-state', 'active');
      const frame = page.locator('iframe'); await expect(frame).toHaveAttribute('title', `SBB Oxygen House - ${branch}`);
      const src = (await frame.getAttribute('src'))!; expect(src).toContain('https://maps.google.com/maps?q='); mapSources.add(src);
    }
    expect(mapSources.size).toBe(branches.length);
  });

  test('@contact-us @functional @footer footer content and links are complete', async ({ page }) => {
    const footer = new ContactPage(page).footer; await footer.scrollIntoViewIfNeeded(); await expect(footer).toBeVisible();
    for (const heading of ['Our Locations', 'Call Centre', 'Social Media', 'Quick Links']) await expect(footer.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    for (const [name, href] of [['Home', '/'], ['About Us', '/about'], ['Contact Us', '/contact'], ['Equipments', '/shop'], ['Services', '/services']]) {
      await expect(footer.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    }
    await expect(footer.locator('a[href^="mailto:"]')).toHaveCount(1); await expect(footer.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
  });
});

