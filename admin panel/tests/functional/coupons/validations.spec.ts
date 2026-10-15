import { test, expect } from '../../../fixtures/coupons.fixture';
import { couponValidationData } from '../../test-data/coupons.data';

test.describe('Admin coupon validations @coupons @functional @validation',()=>{
  test.beforeEach(async({coupons})=>{await coupons.open();await coupons.openNew();});
  test('COUPON-VAL-001 code is required',async({page})=>{await page.getByRole('button',{name:/create coupon/i}).click();await expect(page.getByText(/code is required/i)).toBeVisible();});
  test('COUPON-VAL-002 value has numeric constraints',async({page})=>{const value=page.getByLabel('Value',{exact:true});await value.fill(couponValidationData.negative);expect(await value.evaluate((e:HTMLInputElement)=>e.checkValidity())).toBe(false);});
  test('COUPON-VAL-003 dates accept valid test data',async({page})=>{await page.getByLabel('Starts',{exact:true}).fill('2026-09-01');await page.getByLabel('Ends',{exact:true}).fill('2026-09-30');await expect(page.getByLabel('Ends',{exact:true})).toHaveValue('2026-09-30');});
  test('COUPON-VAL-004 unfinished form closes without creating data',async({page,coupons})=>{const code=`CANCEL${Date.now()}`;await page.getByLabel('Code',{exact:true}).fill(code);await page.keyboard.press('Escape');await expect(coupons.rowByCode(code)).toHaveCount(0);});
});
