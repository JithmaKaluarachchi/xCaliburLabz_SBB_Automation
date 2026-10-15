import { couponHeaders } from '../../../pages/coupons.page';
import { test, expect } from '../../../fixtures/coupons.fixture';

test.describe('Admin coupons functional @coupons @functional', () => {
  test.beforeEach(async ({ coupons }) => coupons.open());
  test('COUPON-F-001 displays identity, search and table @smoke', async ({ page, coupons }) => {
    await expect(coupons.description).toBeVisible(); await expect(coupons.search).toBeVisible(); await expect(coupons.newCoupon).toBeVisible();
    for (const header of couponHeaders) await expect(page.getByRole('columnheader', { name: header, exact: true })).toBeVisible();
  });
  test('COUPON-F-002 searches live coupon data', async ({ coupons }) => {
    const code = await coupons.firstCode(); await coupons.search.fill(code); await expect(coupons.rowByCode(code)).toHaveCount(1);
  });
  test('COUPON-F-003 new form contains every configured field', async ({ page, coupons }) => {
    await coupons.openNew();
    for (const label of ['Code','Type','Description','Value','Min subtotal','Max discount','Usage limit','Per customer','Starts','Ends','Active']) await expect(page.getByText(label,{exact:true}).first()).toBeVisible();
    await expect(page.getByRole('button',{name:/create coupon/i})).toBeVisible();
  });
  test('COUPON-F-004 edit loads existing data without saving', async ({ page, coupons }) => {
    const code=await coupons.firstCode(); await coupons.openEdit(code); await expect(page.getByLabel('Code',{exact:true})).toHaveValue(code); await page.keyboard.press('Escape');
  });
  test('COUPON-F-005 delete confirmation supports cancellation', async ({ page, coupons }) => {
    const code=await coupons.firstCode(); await coupons.openDelete(code); await expect(page.getByText(/permanently deleted/i)).toContainText(code); await page.getByRole('button',{name:'Cancel',exact:true}).click(); await expect(coupons.rowByCode(code)).toHaveCount(1);
  });
});
