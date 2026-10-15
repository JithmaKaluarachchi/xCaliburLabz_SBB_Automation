import { test, expect } from '../../../fixtures/test.fixture';
import { ContactPage } from '../../../pages/contact.page';

test('@contact-us @ui sections, form controls and map are visible and usable', async ({ page }) => {
  const contact = new ContactPage(page); await contact.open();
  const sections = page.locator('main section'); await expect(sections).toHaveCount(3);
  for (let i = 0; i < await sections.count(); i++) {
    const section = sections.nth(i); await section.scrollIntoViewIfNeeded(); await expect(section).toBeVisible();
    const box = await section.boundingBox(); expect(box?.width ?? 0).toBeGreaterThan(250); expect(box?.height ?? 0).toBeGreaterThan(100);
  }
  for (const label of ['Name', 'Email', 'Phone (optional)', 'Subject (optional)', 'Message']) {
    const control = page.getByLabel(label, { exact: true }); await expect(control).toBeVisible(); const box = await control.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(40); expect(box?.width ?? 0).toBeGreaterThan(150);
  }
  await expect(page.locator('iframe')).toBeVisible();
});

test('@contact-us @ui @keyboard primary form and branch controls are keyboard reachable', async ({ page }) => {
  const contact = new ContactPage(page); await contact.open();
  const reached = new Set<string>(); const targets = ['name', 'email', 'phone', 'subject', 'message'];
  for (let i = 0; i < 40 && reached.size < targets.length; i++) {
    await page.keyboard.press('Tab'); const name = await page.evaluate(() => (document.activeElement as HTMLInputElement | HTMLTextAreaElement)?.name ?? '');
    if (targets.includes(name)) reached.add(name);
  }
  expect([...reached].sort()).toEqual([...targets].sort());
});

