export const orderTestData = {
  statuses: ['CONFIRMED', 'PROCESSING', 'CANCELLED', 'REFUNDED'],
  payments: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
  detailPaymentStatuses: ['PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
  invalidSearch: `AUTO-NOT-FOUND-${Date.now()}`,
  statusNote: 'Automated order status verification note.',
  paymentNote: 'Automated payment status verification note.'
} as const;
