export function createCouponData(stamp = Date.now()) {
  const code = `AUTO${stamp}`;
  return {
    code,
    editedCode: `${code}EDIT`,
    description: 'Automation percentage coupon for form and persistence testing.',
    editedDescription: 'Updated by the automated coupon edit test.',
    value: '15', editedValue: '20', minSubtotal: '5000', maxDiscount: '1500',
    usageLimit: '10', perCustomer: '2', starts: '2026-09-01', ends: '2026-09-30'
  };
}
export const couponValidationData = { zero: '0', negative: '-1', percentageOverMaximum: '101' } as const;
