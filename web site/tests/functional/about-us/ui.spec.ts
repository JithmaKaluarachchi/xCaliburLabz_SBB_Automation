import { test, expect } from '../../../fixtures/test.fixture';
import { AboutPage } from '../../../pages/about.page';

test('@about-us @ui all sections are visible, ordered and within the viewport', async ({ page }) => {
  const about = new AboutPage(page); await about.open();
  const sections = page.locator('main section'); await expect(sections).toHaveCount(6);
  const documentPositions = await sections.evaluateAll(items => items.map(item => item.getBoundingClientRect().top + window.scrollY));
  expect(documentPositions).toEqual([...documentPositions].sort((a, b) => a - b));
  for (let i = 0; i < await sections.count(); i++) {
    const section = sections.nth(i); await section.scrollIntoViewIfNeeded(); await expect(section).toBeVisible();
    const box = await section.boundingBox(); expect(box?.width ?? 0).toBeGreaterThan(250); expect(box?.height ?? 0).toBeGreaterThan(80);
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0); expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
  }
});

test('@about-us @ui @keyboard primary About Us actions are keyboard reachable', async ({ page }) => {
  const about = new AboutPage(page); await about.open();
  const targets = ['Browse Products', 'Our Services', 'Contact Us', 'Call Us']; const reached = new Set<string>();
  for (let i = 0; i < 45 && reached.size < targets.length; i++) {
    await page.keyboard.press('Tab'); const name = await page.evaluate(() => (document.activeElement?.textContent ?? '').trim());
    for (const target of targets) if (name === target) reached.add(target);
  }
  expect([...reached].sort()).toEqual([...targets].sort());
});
