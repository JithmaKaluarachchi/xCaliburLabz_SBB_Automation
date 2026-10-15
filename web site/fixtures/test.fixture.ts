import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

type AppFixtures = { homePage: HomePage };

export const test = base.extend<AppFixtures>({
  homePage: async ({ page }, use) => {
    // Production can show an advertisement dialog after hydration. Close it
    // automatically whenever it blocks the homepage control under test.
    await page.addLocatorHandler(page.getByRole('dialog'), async (dialog) => {
      const closeButton = dialog.getByRole('button', { name: 'Close' });
      if (await closeButton.isVisible()) await closeButton.click();
    });
    await use(new HomePage(page));
  }
});

export { expect };
