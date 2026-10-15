import { expect, Locator, Page } from '@playwright/test';

export const adminRoutes = [
  ['Dashboard', '/admin'], ['Products', '/admin/products'], ['Categories', '/admin/categories'],
  ['Brands', '/admin/brands'], ['Orders', '/admin/orders'], ['Coupons', '/admin/coupons'],
  ['Shipping', '/admin/shipping'], ['Advertisements', '/admin/advertisements'],
  ['Reviews', '/admin/reviews'], ['Contact Messages', '/admin/contact'],
  ['Inventory', '/admin/inventory'], ['Settings', '/admin/settings'],
  ['Account & Access', '/admin/users']
] as const;

export class SideNavigationPage {
  readonly sidebar: Locator;
  readonly mobileDrawer: Locator;
  readonly openMenu: Locator;

  constructor(readonly page: Page) {
    // Desktop uses an aside; the mobile drawer uses an accessible dialog.
    // Both can coexist in the DOM, so scope interactions to the visible copy.
    this.sidebar = page.locator('aside:visible, [role="dialog"]:visible').filter({
      has: page.getByRole('link', { name: 'Products', exact: true })
    }).first();
    this.mobileDrawer = page.getByRole('dialog').filter({
      has: page.getByRole('link', { name: 'Products', exact: true })
    });
    this.openMenu = page.getByRole('button', { name: 'Open menu' }).filter({ visible: true });
  }

  async authenticate() {
    if (process.env.ADMIN_STORAGE_STATE) {
      await this.page.goto('/admin', { waitUntil: 'domcontentloaded' });
      const products = this.page.getByRole('link', { name: 'Products', exact: true });
      const dashboardReady = await Promise.race([
        products.waitFor({ state: 'attached', timeout: 4_000 }).then(() => true).catch(() => false),
        this.openMenu.waitFor({ state: 'visible', timeout: 4_000 }).then(() => true).catch(() => false)
      ]);
      if (dashboardReady && new URL(this.page.url()).pathname.replace(/\/$/, '') === '/admin') return;
    }
    await this.loginThroughUi();
  }

  private async loginThroughUi() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
    if (!/\/admin\/login/.test(this.page.url()))
      await this.page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    // The page is server-rendered. Wait until React has attached the form handler.
    await this.page.waitForFunction(() => {
      const form = document.querySelector('form');
      return Boolean(form && Object.keys(form).some((key) => key.startsWith('__reactProps$')));
    }, undefined, { timeout: 15_000 });
    await this.page.getByLabel('Email', { exact: true }).fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(this.page).toHaveURL(/\/admin\/?$/, { timeout: 20_000 });
    await expect(this.page.locator('body')).toContainText(/Dashboard|Open menu/i);
  }

  async ensureOpen() {
    if (!(await this.sidebar.isVisible())) {
      await this.openMenu.click();
      await expect(this.sidebar).toBeVisible();
      await this.waitForMotionToFinish();
    }
  }

  private async waitForMotionToFinish() {
    await this.sidebar.evaluate(async (element) => {
      const animations = element.getAnimations({ subtree: true });
      await Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));
    });
  }

  link(name: string) { return this.sidebar.getByRole('link', { name, exact: true }); }

  group(name: string) { return this.sidebar.getByText(name, { exact: true }); }

  brand() { return this.sidebar.getByText(/SBB Oxygen (?:House|Admin)/i).first(); }

  homeLink() { return this.link('Dashboard'); }

  async goThroughSidebar(name: string, path: string) {
    await this.ensureOpen();
    const usedMobileDrawer = await this.mobileDrawer.isVisible();
    const link = this.link(name);
    await link.click();
    await expect(this.page).toHaveURL(new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`), { timeout: 15_000 });
    await this.page.waitForLoadState('domcontentloaded');
    // Mobile route selection closes the dialog. Waiting for that lifecycle
    // prevents the next iteration from targeting the outgoing drawer.
    if (usedMobileDrawer) await expect(this.mobileDrawer).toBeHidden();
  }
}
