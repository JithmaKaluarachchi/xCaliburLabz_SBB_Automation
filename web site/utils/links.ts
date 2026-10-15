import type { Page } from '@playwright/test';

export async function getUniqueInternalLinks(page: Page): Promise<string[]> {
  const origin = new URL(page.url()).origin;
  const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).href)
  );

  return [...new Set(hrefs)].filter((href) => {
    try {
      const url = new URL(href);
      return url.origin === origin && ['http:', 'https:'].includes(url.protocol) && !url.hash;
    } catch {
      return false;
    }
  });
}
