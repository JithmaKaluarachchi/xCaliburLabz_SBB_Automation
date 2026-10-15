import { test, expect } from '../../../fixtures/coupons.fixture';
import { createCouponData } from '../../test-data/coupons.data';

test('COUPON-F-006 validates, creates, edits and deletes its own coupon @coupons @functional @mutation', async ({ page, coupons }) => {
  test.setTimeout(90_000); const d=createCouponData(); let current=d.code; let created=false;
  const field=(name:string)=>page.getByLabel(name,{exact:true});
  try {
    await coupons.open(); await coupons.openNew(); await page.getByRole('button',{name:/create coupon/i}).click();
    await expect(page.getByText(/code is required/i)).toBeVisible();
    await field('Code').fill(d.code); await field('Description').fill(d.description); await field('Value').fill(d.value);
    await field('Min subtotal').fill(d.minSubtotal); await field('Max discount').fill(d.maxDiscount); await field('Usage limit').fill(d.usageLimit); await field('Per customer').fill(d.perCustomer);
    await field('Starts').fill(d.starts); await field('Ends').fill(d.ends); await page.getByRole('button',{name:/create coupon/i}).click();
    await expect(page.getByRole('heading',{name:'New coupon',exact:true})).toBeHidden({timeout:20000}); created=true;
    await coupons.open(); await expect(coupons.rowByCode(d.code)).toHaveCount(1); await coupons.openEdit(d.code);
    await expect(field('Description')).toHaveValue(d.description); await expect(field('Value')).toHaveValue(d.value);
    await field('Description').fill(d.editedDescription); await field('Value').fill(d.editedValue);
    await page.getByRole('button',{name:/save changes/i}).click(); await expect(page.getByRole('heading',{name:'Edit coupon',exact:true})).toBeHidden({timeout:20000});
    await coupons.open(); await coupons.openEdit(current); await expect(field('Description')).toHaveValue(d.editedDescription); await expect(field('Value')).toHaveValue(d.editedValue); await page.keyboard.press('Escape');
    await coupons.openDelete(current); await page.getByRole('button',{name:'Delete',exact:true}).click(); await expect(coupons.rowByCode(current)).toHaveCount(0); created=false;
  } finally {
    if(created){ await coupons.open(); if(await coupons.rowByCode(current).count()===1){ await coupons.openDelete(current); await page.getByRole('button',{name:'Delete',exact:true}).click(); } }
  }
});
