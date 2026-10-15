import { test, expect } from '../../../fixtures/test.fixture';

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' }
];

const serviceNavigation = [
  { name: 'All Gases & Equipments', path: '/services/all-gases-and-equipments' },
  { name: 'Ship Handling', path: '/services/ship-handling' }
];

test.describe('Complete homepage feature coverage', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.page.locator('main section')).toHaveCount(8, { timeout: 20_000 });
  });

  test('@homepage @header header contains working logo, contact, cart, and navigation controls', async ({ homePage }) => {
    await expect(homePage.header).toBeVisible();
    await expect(homePage.logoLink).toHaveAttribute('href', '/');
    await expect(homePage.logoLink.locator('img')).toHaveAttribute('alt', 'SBB Oxygen House');
    await expect(homePage.cartLink).toHaveAttribute('href', '/cart');
    await expect(homePage.callLink).toHaveAttribute('href', /^tel:\+94765535515$/);

    if (await homePage.navigation.isVisible()) {
      for (const item of navigation) {
        await expect(homePage.navigation.getByRole('link', { name: item.name, exact: true }))
          .toHaveAttribute('href', item.path);
      }
      await expect(homePage.navigation.getByRole('button', { name: /Services/i })).toHaveAttribute('aria-haspopup', 'true');
      for (const item of serviceNavigation) {
        await expect(homePage.navigation.locator(`a[href="${item.path}"]`)).toHaveCount(1);
      }
    } else {
      await expect(homePage.menuButton).toBeVisible();
      await expect(homePage.menuButton).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('@homepage @navigation primary page destinations respond successfully', async ({ request, baseURL }) => {
    for (const item of [...navigation, ...serviceNavigation, { name: 'Cart', path: '/cart' }]) {
      const response = await request.get(new URL(item.path, baseURL).toString(), { failOnStatusCode: false });
      expect(response.status(), `${item.name} (${item.path}) should load`).toBeLessThan(400);
    }
  });

  test('@homepage @navigation clicking Shop navigates to the correct page', async ({ homePage, page }) => {
    if (await homePage.navigation.isVisible()) {
      await homePage.navigation.getByRole('link', { name: 'Shop', exact: true }).click();
    } else {
      await homePage.openMobileMenu();
      await expect(homePage.menuButton).toHaveAttribute('aria-expanded', 'true');
      await homePage.mobileMenu.getByRole('link', { name: 'Shop', exact: true }).click();
    }
    await expect(page).toHaveURL(/\/shop\/?$/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('@homepage @mobile mobile navigation opens, exposes links, and closes', async ({ homePage }) => {
    test.skip(!(await homePage.menuButton.isVisible()), 'Desktop project uses the desktop navigation');

    await homePage.openMobileMenu();
    await expect(homePage.menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(homePage.mobileMenu).toBeVisible();
    for (const item of navigation) {
      await expect(homePage.mobileMenu.getByRole('link', { name: item.name, exact: true })).toHaveAttribute('href', item.path);
    }

    await homePage.menuButton.click();
    await expect(homePage.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(homePage.mobileMenu).toBeHidden();
  });

  test('@homepage @content has semantic structure and expected business content', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: /Your Primary Gas Solutions/i })).toBeVisible();
    await expect(page.getByText(/SBB Oxygen House/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Main Branch', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wattala Branch', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Panchikawatte Branch', exact: true })).toBeVisible();
    await expect(page.getByText(/Monday\s*[–-]\s*Saturday/i)).toBeVisible();
    expect(await page.locator('main section').count()).toBeGreaterThanOrEqual(2);
  });

  test('@homepage @buttons buttons and CTA links have safe, meaningful actions', async ({ page }) => {
    const actionableElements = page.locator('main a[href], main button');
    expect(await actionableElements.count()).toBeGreaterThan(0);

    const invalid = await page.locator('main a[href]').evaluateAll((links) => links
      .map((link) => ({ text: (link.textContent ?? '').trim(), href: link.getAttribute('href') ?? '' }))
      .filter((link) => !link.href || link.href === '#' || /^javascript:/i.test(link.href)));
    expect(invalid, 'CTA links must not use empty, #, or javascript destinations').toEqual([]);

    const unnamedButtons = await page.locator('button:visible').evaluateAll((buttons) => buttons
      .filter((button) => !((button.textContent ?? '').trim() || button.getAttribute('aria-label') || button.getAttribute('title')))
      .length);
    expect(unnamedButtons, 'Every visible button needs an accessible name').toBe(0);
  });

  test('@homepage @images all content images load and have alternative text', async ({ page }) => {
    const images = page.locator('img');
    expect(await images.count()).toBeGreaterThan(0);
    for (let index = 0; index < await images.count(); index += 1) {
      await images.nth(index).scrollIntoViewIfNeeded();
    }
    await expect.poll(async () => images.evaluateAll((items) => items.filter((item) => !(item as HTMLImageElement).complete).length))
      .toBe(0);

    const broken = await images.evaluateAll((items) => items
      .map((item) => {
        const image = item as HTMLImageElement;
        return { src: image.currentSrc || image.src, alt: image.getAttribute('alt'), width: image.naturalWidth };
      })
      .filter((image) => image.width === 0 || image.alt === null));
    expect(broken, 'Images must load and define alt (empty alt is valid for decorative images)').toEqual([]);
  });

  test('@homepage @image-links linked images have accessible link names and real destinations', async ({ page }) => {
    const imageLinks = page.locator('a:has(img)');
    expect(await imageLinks.count()).toBeGreaterThan(0);
    const invalid = await imageLinks.evaluateAll((links) => links
      .map((link) => ({
        href: link.getAttribute('href') ?? '',
        name: link.getAttribute('aria-label') ?? link.querySelector('img')?.getAttribute('alt') ?? ''
      }))
      .filter((link) => !link.href || link.href === '#' || !link.name.trim()));
    expect(invalid).toEqual([]);
  });

  test('@homepage @footer footer provides contact and legal/navigation information', async ({ homePage }) => {
    await homePage.footer.scrollIntoViewIfNeeded();
    await expect(homePage.footer).toBeVisible();
    await expect(homePage.footer.getByRole('link', { name: /sbboxygen@gmail.com/i }).first())
      .toHaveAttribute('href', /^mailto:/);
    expect(await homePage.footer.locator('a[href]').count()).toBeGreaterThanOrEqual(3);
    await expect(homePage.footer).toContainText(/SBB|Oxygen/i);
  });

  test('@homepage @seo title, metadata, language, canonical URL, and structured data are present', async ({ page }) => {
    await expect(page).toHaveTitle(/SBB Oxygen House.*Oxygen.*Sri Lanka/i);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /oxygen supplier/i);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/sbb\.caliburlabz\.com\/?$/);
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
  });

  test('@homepage @quality emits no uncaught page errors and no same-origin failed requests', async ({ page }) => {
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => {
      if (new URL(request.url()).origin === new URL(page.url()).origin) {
        failedRequests.push(`${request.failure()?.errorText ?? 'FAILED'} ${request.url()}`);
      }
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(1_000);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  test('@homepage @keyboard interactive controls are keyboard reachable', async ({ page }) => {
    const focusable = page.locator('a[href]:visible, button:visible, input:visible, select:visible, textarea:visible');
    expect(await focusable.count()).toBeGreaterThan(0);
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).not.toHaveJSProperty('tagName', 'BODY');
  });

  test('@homepage @ui key layout areas are visible and stay within the viewport', async ({ homePage, page }) => {
    await expect(homePage.header).toBeVisible();
    await expect(homePage.heading).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.contentWidth, 'The page must not create horizontal scrolling')
      .toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  });

  test('@homepage @scroll visits every homepage section and reveals its content', async ({ page }) => {
    const sections = page.locator('main section');
    expect(await sections.count()).toBe(8);

    for (let index = 0; index < await sections.count(); index += 1) {
      const section = sections.nth(index);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeInViewport();
      await expect(section).toBeVisible();
      expect((await section.innerText()).trim().length, `Section ${index + 1} should contain content`).toBeGreaterThan(0);
    }
  });

  test('@homepage @cta hero and section buttons navigate to their correct pages', async ({ page }) => {
    const expectedCtas = [
      { name: 'Buy Now', path: '/shop' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Explore More', path: '/shop' },
      { name: 'Explore Our Gases', path: '/shop' }
    ];

    for (const cta of expectedCtas) {
      const link = page.locator(`main a[href="${cta.path}"]`).filter({ hasText: cta.name }).first();
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', cta.path);
    }
  });

  test('@homepage @products product pictures open the matching product detail pages', async ({ page }) => {
    const productSection = page.locator('main section').filter({ hasText: 'Our Products' });
    await productSection.scrollIntoViewIfNeeded();
    const productLinks = page.locator('main a[href^="/shop/"]:has(img)');
    await expect(productLinks).toHaveCount(6, { timeout: 20_000 });

    for (let index = 0; index < await productLinks.count(); index += 1) {
      const link = productLinks.nth(index);
      const image = link.locator('img');
      await expect(link).toHaveAttribute('href', /^\/shop\/[a-z0-9-]+$/);
      await expect(image).toHaveAttribute('alt', /\S+/);
    }

    const firstHref = await productLinks.first().getAttribute('href');
    await productLinks.first().click();
    await expect(page).toHaveURL(new RegExp(`${firstHref!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
    await expect(page.locator('main')).toBeVisible();
  });

  test('@homepage @carousel product arrows, indicators, and swipe gesture move the carousel', async ({ page }) => {
    const productSection = page.locator('main section').filter({ hasText: 'Our Products' });
    await productSection.scrollIntoViewIfNeeded();
    const firstCard = page.locator('main a[href^="/shop/"]:has(img)').first();
    const next = page.getByRole('button', { name: 'Next product' });
    const previous = page.getByRole('button', { name: 'Previous product' });

    await expect(next).toBeVisible();
    await expect(previous).toBeVisible();
    await expect(page.getByRole('button', { name: /^Go to product / })).toHaveCount(6);
    const initialX = (await firstCard.boundingBox())!.x;
    await next.click();
    await expect.poll(async () => (await firstCard.boundingBox())!.x).not.toBe(initialX);
    const afterNextX = (await firstCard.boundingBox())!.x;
    await previous.click();
    await expect.poll(async () => Math.round((await firstCard.boundingBox())!.x)).not.toBe(Math.round(afterNextX));

    const box = await productSection.boundingBox();
    expect(box).not.toBeNull();
    const beforeSwipeX = (await firstCard.boundingBox())!.x;
    await page.mouse.move(box!.x + box!.width * 0.75, box!.y + box!.height * 0.55);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.25, box!.y + box!.height * 0.55, { steps: 12 });
    await page.mouse.up();
    await expect.poll(async () => Math.round((await firstCard.boundingBox())!.x)).not.toBe(Math.round(beforeSwipeX));
  });

  test('@homepage @services service pictures navigate to their matching service pages', async ({ homePage, page }) => {
    const services = [
      { alt: 'All Gases & Equipments', path: '/services/all-gases-and-equipments' },
      { alt: 'Ship Handling', path: '/services/ship-handling' }
    ];

    for (const service of services) {
      await homePage.open();
      await expect(page.locator('main section')).toHaveCount(8, { timeout: 20_000 });
      const card = page.locator(`main a[href="${service.path}"]:has(img[alt="${service.alt}"])`);
      const image = card.locator('img');
      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible();
      await expect(image).toBeVisible();
      await card.click();
      await expect(page).toHaveURL(new RegExp(`${service.path}/?$`));
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('@homepage @animations scrolling activates section and image entrance animations', async ({ page }) => {
    const sections = page.locator('main section');
    let animatedElements = 0;
    let visibleAnimatedElements = 0;

    for (let index = 0; index < await sections.count(); index += 1) {
      const section = sections.nth(index);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const result = await section.evaluate((element) => {
        const candidates = [...element.querySelectorAll<HTMLElement>('[style*="transition"], [class*="transition"]')];
        const visible = candidates.filter((candidate) => {
          const style = getComputedStyle(candidate);
          const rect = candidate.getBoundingClientRect();
          return style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
        });
        return { candidates: candidates.length, visible: visible.length };
      });
      animatedElements += result.candidates;
      visibleAnimatedElements += result.visible;
    }
    expect(animatedElements, 'Expected animated elements across the homepage').toBeGreaterThan(10);
    expect(visibleAnimatedElements, 'Scrolling should reveal animated text, pictures, and cards').toBeGreaterThan(10);
  });

  test('@homepage @footer all footer link types are present and internal links work', async ({ homePage, page, request, baseURL }) => {
    await homePage.footer.scrollIntoViewIfNeeded();
    const footerLinks = homePage.footer.locator('a[href]');
    expect(await footerLinks.count()).toBeGreaterThanOrEqual(16);
    await expect(homePage.footer.locator('a[href^="https://wa.me/"]')).toHaveCount(1);
    await expect(homePage.footer.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(homePage.footer.getByRole('link', { name: 'facebook' })).toHaveAttribute('href', /^https:\/\/www\.facebook\.com/);
    await expect(homePage.footer.getByRole('link', { name: 'instagram' })).toHaveAttribute('href', /^https:\/\/www\.instagram\.com/);
    await expect(homePage.footer.getByRole('link', { name: 'linkedin' })).toHaveAttribute('href', /^https:\/\/linkedin\.com/);
    await expect(homePage.footer.getByRole('link', { name: 'youtube' })).toHaveAttribute('href', /^https:\/\/youtube\.com/);

    const internalHrefs = await footerLinks.evaluateAll((links) => [...new Set(links
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('/'))) ]);
    for (const href of internalHrefs) {
      const response = await request.get(new URL(href, baseURL).toString(), { failOnStatusCode: false });
      expect(response.status(), `Footer destination ${href} should load`).toBeLessThan(400);
    }

    await homePage.footer.locator('a[href="/contact"]').last().click();
    await expect(page).toHaveURL(/\/contact\/?$/);
  });
});
