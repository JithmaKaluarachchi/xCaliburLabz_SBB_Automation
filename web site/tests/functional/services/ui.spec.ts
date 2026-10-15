import { test, expect } from '../../../fixtures/test.fixture';
import { services } from './service-data';
import { ServicePage } from '../../../pages/service.page';

for (const service of services) {
  test(`@services @ui ${service.name} key sections and controls are visible and usable`, async ({ page }) => {
    const servicePage = new ServicePage(page);
    await servicePage.open(service);
    await servicePage.expectCoreContent(service);
    for (const section of await page.locator('main section').all()) {
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
      const box = await section.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(250);
      expect(box?.height ?? 0).toBeGreaterThan(80);
    }
    for (const link of await servicePage.main.getByRole('link').all()) {
      const text = (await link.innerText()).trim();
      if (!text) continue;
      const box = await link.boundingBox();
      expect(box?.width ?? 0, text).toBeGreaterThanOrEqual(24);
      expect(box?.height ?? 0, text).toBeGreaterThanOrEqual(24);
    }
  });

  test(`@services @ui @keyboard ${service.name} primary actions are keyboard reachable`, async ({ page }) => {
    const servicePage = new ServicePage(page);
    await servicePage.open(service);
    const targets = ['Request a Quote', 'Call Us'];
    const reached = new Set<string>();
    for (let i = 0; i < 30 && reached.size < targets.length; i++) {
      await page.keyboard.press('Tab');
      const name = await page.evaluate(() => (document.activeElement?.textContent ?? '').trim());
      for (const target of targets) if (name === target) reached.add(target);
    }
    expect([...reached].sort()).toEqual([...targets].sort());
  });
}
