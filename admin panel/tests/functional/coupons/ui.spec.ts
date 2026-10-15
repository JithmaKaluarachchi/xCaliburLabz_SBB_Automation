import { test, expect } from '../../../fixtures/coupons.fixture';
test.describe('Admin coupons UI @coupons @functional @ui',()=>{
 test('COUPON-UI-001 controls are visible focusable and sized',async({coupons})=>{await coupons.open();for(const c of[coupons.search,coupons.newCoupon]){const b=await c.boundingBox();expect(b).not.toBeNull();expect(b!.height).toBeGreaterThanOrEqual(24);}await coupons.search.focus();await expect(coupons.search).toBeFocused();});
 test('COUPON-UI-002 modal closes with Escape',async({page,coupons})=>{await coupons.open();await coupons.openNew();await page.keyboard.press('Escape');await expect(page.getByRole('heading',{name:'New coupon',exact:true})).toBeHidden();});
});
